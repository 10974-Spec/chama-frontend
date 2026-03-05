const fs = require('fs');
const path = require('path');

const walkSync = function (dir, filelist) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                filelist = walkSync(path.join(dir, file), filelist);
            }
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

const SRC_DIR = '/home/nyakoe/Desktop/chama/src';
const APP_TSX = '/home/nyakoe/Desktop/chama/App.tsx';

let files = walkSync(SRC_DIR);
files.push(APP_TSX);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Has colors import?
    if (content.includes('import { colors') || content.includes('import { typography, colors }') || content.includes('import { colors, typography }')) {

        // Is it a React component file?
        if (content.includes('export default function ') || content.includes('export const ') || content.includes('const ') && content.includes('=> {')) {

            // Skip some system files 
            if (file.includes('ThemeContext.tsx') || file.includes('colors.ts')) return;

            // Replace import
            // For case: import { colors, typography } from '../theme';
            content = content.replace(/import\s*\{\s*colors\s*,\s*typography\s*\}\s*from\s*['"]([^'"]+)['"];?/g, "import { typography } from '$1';\nimport { useTheme } from '$1/ThemeContext';");
            content = content.replace(/import\s*\{\s*typography\s*,\s*colors\s*\}\s*from\s*['"]([^'"]+)['"];?/g, "import { typography } from '$1';\nimport { useTheme } from '$1/ThemeContext';");
            // For case: import { colors } from '../theme';
            content = content.replace(/import\s*\{\s*colors\s*\}\s*from\s*['"]([^'"]+)['"];?/g, "import { useTheme } from '$1/ThemeContext';");

            // We replaced imports, now we need to inject `const { colors } = useTheme();` into the component body.
            // Match `export default function ComponentName(props) {`
            content = content.replace(/(export default function \w+\([^)]*\)\s*\{)/g, "$1\n    const { colors } = useTheme();");
            content = content.replace(/(export const \w+\s*=\s*\([^)]*\)\s*=>\s*\{)/g, "$1\n    const { colors } = useTheme();");
            content = content.replace(/(const \w+\s*=\s*\([^)]*\)\s*=>\s*\{)/g, "$1\n    const { colors } = useTheme();");

            // Change StyleSheet.create to dynamic function if colors used
            if (content.includes('StyleSheet.create') && !content.includes('const makeStyles =')) {
                // Because StyleSheet uses `colors`, we have to wrap it in a function
                content = content.replace(/const styles = StyleSheet.create\(\{([\s\S]*?)\}\);/g, "const makeStyles = (colors: any) => StyleSheet.create({$1});");

                // And inject `const styles = makeStyles(colors);` safely after `useTheme()`
                content = content.replace(/const \{ colors \} = useTheme\(\);/g, "const { colors } = useTheme();\n    const styles = makeStyles(colors);");

                // NOTE: If a file defines styles but doesn't have a standard React component signature, 
                // it will have `makeStyles` but no `const styles = makeStyles(colors)`.
                // The above injection handles it inside the component.
            }

            if (content !== originalContent) {
                fs.writeFileSync(file, content, 'utf8');
                console.log('Refactored: ', file);
            }
        }
    }
});

console.log('Complete');
