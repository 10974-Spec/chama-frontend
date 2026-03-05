const fs = require('fs');
const path = require('path');

const dir = '/home/nyakoe/Desktop/chama/src/screens';

function walkDir(d, callback) {
    fs.readdirSync(d).forEach(f => {
        let dirPath = path.join(d, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(d, f));
    });
}

const files = [];
walkDir(dir, f => {
    if (f.endsWith('.tsx')) files.push(f);
});

files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');

    // Skip if no StyleSheet.create
    if (!code.includes('StyleSheet.create')) return;

    // If we already converted this file, skip
    if (code.includes('const makeStyles =')) return;

    // 1. Change const styles = StyleSheet.create(...) to const makeStyles = (colors: any) => StyleSheet.create(...)
    if (code.includes('const styles = StyleSheet.create')) {
        code = code.replace(/const styles = StyleSheet\.create/g, 'const makeStyles = (colors: any) => StyleSheet.create');
    } else {
        return; // Couldn't find standard styles declaration
    }

    // 2. Inject context and styles instance into every function that looks like a component (returns JSX and uses 'styles.')
    // A component typically starts with `export default function` or `const X = () => {` or `function X() {`

    // Regex to match functional components broadly:
    // (export default function X(props) {) OR (const X = (props) => {) OR (function X(props) {)
    const compRegex = /(?:export\s+(?:default\s+)?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{|const\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*\{|(?:export\s+)?function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{)/g;

    let match;
    while ((match = compRegex.exec(code)) !== null) {
        const matchText = match[0];
        const injectString = `\n    const { colors } = useTheme();\n    const styles = makeStyles(colors);`;

        // Prevent double injection
        if (code.slice(match.index, match.index + 200).includes('makeStyles(colors)')) {
            continue;
        }

        code = code.replace(matchText, matchText + injectString);
    }

    // 3. Special case for inline components returning directly like `const B = () => <View style={styles.b} />`
    // We cannot easily inject into `=> <View>` without adding `{ return ... }`. 
    // Let's do a quick pass for the most common ones like `const renderItem = ({item}) => <View...`
    const inlineArrowRegex = /(const\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*)(<[A-Za-z]+[^>]*>[\s\S]*?<\/[A-Za-z]+>|<[A-Za-z]+[^>]*\/>)/g;
    code = code.replace(inlineArrowRegex, (fullMatch, declaration, jsx) => {
        return `${declaration} {\n    const { colors } = useTheme();\n    const styles = makeStyles(colors);\n    return ${jsx};\n}`;
    });

    fs.writeFileSync(file, code);
    console.log('Refactored', file);
});
