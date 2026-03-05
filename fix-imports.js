const fs = require('fs');
const exec = require('child_process').execSync;

try {
  exec('cd /home/nyakoe/Desktop/chama && npx tsc --noEmit', { encoding: 'utf8' });
} catch (err) {
  const out = err.stdout;
  const lines = out.split('\n');
  const filesMissingImport = new Set();
  const filesMissingStyles = new Set();

  lines.forEach(l => {
     if(l.includes("Cannot find name 'useTheme'")) {
         const file = l.split('(')[0].trim();
         filesMissingImport.add('/home/nyakoe/Desktop/chama/' + file);
     }
     if(l.includes("Cannot find name 'styles'") || l.includes("Cannot block-scoped variable 'styles'")) {
         const file = l.split('(')[0].trim();
         filesMissingStyles.add('/home/nyakoe/Desktop/chama/' + file);
     }
  });

  filesMissingImport.forEach(file => {
      if(!fs.existsSync(file)) return;
      let c = fs.readFileSync(file, 'utf8');
      if(!c.includes('import { useTheme } from')) {
          // Find distance to root to correctly resolve theme context
          const depth = file.split('/').length - 6; // /home/nyakoe/Desktop/chama/src/...
          const prefix = depth === 1 ? '../' : depth === 2 ? '../../' : '../../../';
          c = c.replace(/import React/, `import { useTheme } from '${prefix}theme/ThemeContext';\nimport React`);
          fs.writeFileSync(file, c);
          console.log('Fixed import in', file);
      }
  });
  
  filesMissingStyles.forEach(file => {
      if(!fs.existsSync(file)) return;
      let c = fs.readFileSync(file, 'utf8');
      c = c.replace(/const makeStyles = \(colors: any\) => StyleSheet\.create/g, 'const styles = StyleSheet.create');
      c = c.replace(/const styles = makeStyles\(colors\);/g, '');
      fs.writeFileSync(file, c);
      console.log('Reverted styles in', file);
  });
}
