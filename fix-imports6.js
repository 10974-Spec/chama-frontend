const fs = require('fs');
const exec = require('child_process').execSync;

try {
    const out = exec('grep -rl "../../../theme/ThemeContext" /home/nyakoe/Desktop/chama/src/screens', { encoding: 'utf8' });
    const files = out.trim().split('\n').filter(Boolean);

    files.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/import \{ useTheme \} from '\.\.\/\.\.\/\.\.\/theme\/ThemeContext';/g, "import { useTheme } from '../../theme/ThemeContext';");
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
    });
    console.log(`Updated ${files.length} files.`);
} catch (e) {
    console.log('No files needed updating or error occurred: ', e.message);
}
