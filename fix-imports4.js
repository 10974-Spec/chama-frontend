const fs = require('fs');
const exec = require('child_process').execSync;

try {
  exec('cd /home/nyakoe/Desktop/chama && npx tsc --noEmit', { encoding: 'utf8' });
} catch (err) {
  const out = err.stdout;
  const lines = out.split('\n');
  const filesMissingThemeContext = new Set();
  const filesMissingStyles = new Set();

  lines.forEach(l => {
     if(l.includes("Cannot find module") && l.includes("ThemeContext")) {
         const file = l.split('(')[0].trim();
         filesMissingThemeContext.add('/home/nyakoe/Desktop/chama/' + file);
     }
     if(l.includes("Cannot find name 'styles'") || l.includes("Cannot block-scoped variable 'styles'")) {
         const file = l.split('(')[0].trim();
         filesMissingStyles.add('/home/nyakoe/Desktop/chama/' + file);
     }
  });

  filesMissingThemeContext.forEach(file => {
      if(!fs.existsSync(file)) return;
      let c = fs.readFileSync(file, 'utf8');
      
      const depth = file.split('/').length - 6;
      // Many screens are in src/screens/auth/ or src/screens/main/ -> depth 3
      // prefix should be '../../' not '../../../'
      const prefix = depth === 1 ? './' : depth === 2 ? '../' : depth === 3 ? '../../' : '../../../';
      
      c = c.replace(/import { useTheme } from '.*?theme\/ThemeContext';/g, `import { useTheme } from '${prefix}theme/ThemeContext';`);
      fs.writeFileSync(file, c);
      console.log('Fixed import path in', file);
  });
  
  filesMissingStyles.forEach(file => {
      if(!fs.existsSync(file)) return;
      let c = fs.readFileSync(file, 'utf8');
      
      // Force static if missing styles entirely
      c = c.replace(/const makeStyles = \([a-zA-Z:]*\)\s*=>\s*StyleSheet\.create/g, 'const styles = StyleSheet.create');
      c = c.replace(/const styles = makeStyles\([^)]+\);/g, '');
      fs.writeFileSync(file, c);
      console.log('Forced static styles to resolve scope in', file);
  });
}
