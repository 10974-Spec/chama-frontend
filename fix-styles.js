const fs = require('fs');
const files = [
  'src/components/ui/Avatar.tsx',
  'src/components/ui/Badge.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/PaymentModal.tsx',
  'src/components/ui/ProgressBar.tsx',
  'src/screens/chama/ChamaFeedTab.tsx',
  'src/screens/main/HomeFeedScreen.tsx',
  'src/screens/main/MyChamasScreen.tsx'
];

files.forEach(file => {
  const fullPath = '/home/nyakoe/Desktop/chama/' + file;
  if (!fs.existsSync(fullPath)) return;
  let c = fs.readFileSync(fullPath, 'utf8');
  
  // Convert makeStyles back to standard StyleSheet.create
  c = c.replace(/const makeStyles = \([^)]*\)\s*=>\s*StyleSheet\.create/g, 'const styles = StyleSheet.create');
  
  // Remove any injected const styles = makeStyles(colors); inside components
  c = c.replace(/const styles = makeStyles\([^)]+\);/g, '');
  
  fs.writeFileSync(fullPath, c);
  console.log('Fixed styles in', file);
});
