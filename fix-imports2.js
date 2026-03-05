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
          const depth = file.split('/').length - 6; // /home/nyakoe/Desktop/chama/src/...
          const prefix = depth === 1 ? '../' : depth === 2 ? '../../' : '../../../';
          
          // Inject right after the last import statement
          const lastImportIndex = c.lastIndexOf('import ');
          if (lastImportIndex !== -1) {
              const endOfLine = c.indexOf('\n', lastImportIndex);
              c = c.slice(0, endOfLine + 1) + `import { useTheme } from '${prefix}theme/ThemeContext';\n` + c.slice(endOfLine + 1);
          } else {
              c = `import { useTheme } from '${prefix}theme/ThemeContext';\n` + c;
          }
          
          fs.writeFileSync(file, c);
          console.log('Fixed import in', file);
      }
  });
  
  filesMissingStyles.forEach(file => {
      if(!fs.existsSync(file)) return;
      let c = fs.readFileSync(file, 'utf8');
      
      // Some files define styles but they are used outside the component.
      // Revert them to static styles.
      c = c.replace(/const makeStyles = \(colors: any\) => StyleSheet\.create/g, 'const styles = StyleSheet.create');
      c = c.replace(/const styles = makeStyles\(colors\);/g, '');
      fs.writeFileSync(file, c);
      console.log('Reverted styles in', file);
  });
}
