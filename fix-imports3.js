const fs = require('fs');
const exec = require('child_process').execSync;

try {
    exec('cd /home/nyakoe/Desktop/chama && npx tsc --noEmit', { encoding: 'utf8' });
} catch (err) {
    const out = err.stdout;
    const lines = out.split('\n');
    const filesMissingImport = new Set();
    const filesMissingStyles = new Set();
    const filesMissingMakeStyles = new Set();

    lines.forEach(l => {
        if (l.includes("Cannot find name 'useTheme'")) {
            const file = l.split('(')[0].trim();
            filesMissingImport.add('/home/nyakoe/Desktop/chama/' + file);
        }
        if (l.includes("Cannot find name 'styles'") || l.includes("Cannot block-scoped variable 'styles'")) {
            const file = l.split('(')[0].trim();
            filesMissingStyles.add('/home/nyakoe/Desktop/chama/' + file);
        }
        if (l.includes("Cannot find name 'makeStyles'")) {
            const file = l.split('(')[0].trim();
            filesMissingMakeStyles.add('/home/nyakoe/Desktop/chama/' + file);
        }
    });

    filesMissingImport.forEach(file => {
        if (!fs.existsSync(file)) return;
        let c = fs.readFileSync(file, 'utf8');

        const depth = file.split('/').length - 6;
        const prefix = depth === 1 ? '../' : depth === 2 ? '../../' : '../../../';
        const injectLine = `import { useTheme } from '${prefix}theme/ThemeContext';\n`;

        if (!c.includes('import { useTheme }')) {
            const firstImportEnd = c.indexOf('\n', c.indexOf('import '));
            if (firstImportEnd !== -1) {
                c = c.slice(0, firstImportEnd + 1) + injectLine + c.slice(firstImportEnd + 1);
            } else {
                c = injectLine + c;
            }
        }

        const componentMatch = c.match(/export default function \w+\([^)]*\)\s*\{/);
        if (componentMatch && !c.includes('const { colors } = useTheme();')) {
            c = c.replace(componentMatch[0], componentMatch[0] + '\n    const { colors } = useTheme();');
        }

        fs.writeFileSync(file, c);
        console.log('Fixed useTheme in', file);
    });

    filesMissingStyles.forEach(file => {
        if (!fs.existsSync(file)) return;
        let c = fs.readFileSync(file, 'utf8');

        if (c.includes('const makeStyles =')) {
            c = c.replace(/const makeStyles = \([a-zA-Z:]*\)\s*=>\s*StyleSheet\.create/g, 'const styles = StyleSheet.create');
            c = c.replace(/const styles = makeStyles\([^)]+\);/g, '');
            fs.writeFileSync(file, c);
            console.log('Reverted static styles in', file);
        } else {
            const componentMatch = c.match(/(export default function \w+\([^)]*\)\s*\{[\s\S]*?)(return \(|return null)/);
            if (componentMatch && !c.includes('const styles = makeStyles(colors);') && c.includes('const makeStyles =')) {
                c = c.replace(/const \{ colors \} = useTheme\(\);/, 'const { colors } = useTheme();\n    const styles = makeStyles(colors);');
                fs.writeFileSync(file, c);
                console.log('Fixed dynamic styles in', file);
            }
        }
    });

    filesMissingMakeStyles.forEach(file => {
        if (!fs.existsSync(file)) return;
        let c = fs.readFileSync(file, 'utf8');
        c = c.replace(/const styles = makeStyles\([^)]+\);/g, '/* Removed makeStyles */');
        fs.writeFileSync(file, c);
        console.log('Fixed broken makeStyles call in', file);
    });
} 
