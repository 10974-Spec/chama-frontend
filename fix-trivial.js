const fs = require('fs');

const fixDuplicates = (f) => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/import \{ colors \} from '\.\.\/\.\.\/theme';\nimport \{ useTheme \} from '\.\.\/\.\.\/theme\/ThemeContext';/, "import { useTheme } from '../../theme/ThemeContext';");
  fs.writeFileSync(f, c);
};

['src/components/ui/Avatar.tsx', 'src/components/ui/Badge.tsx', 'src/components/ui/ProgressBar.tsx', 'src/screens/main/HomeFeedScreen.tsx', 'src/screens/main/MyChamasScreen.tsx'].forEach(file => {
  fixDuplicates('/home/nyakoe/Desktop/chama/' + file);
});

let btn = fs.readFileSync('/home/nyakoe/Desktop/chama/src/components/ui/Button.tsx', 'utf8');
btn = btn.replace(/makeStyles\[/g, 'styles[');
fs.writeFileSync('/home/nyakoe/Desktop/chama/src/components/ui/Button.tsx', btn);

console.log('Fixed trivial errors');
