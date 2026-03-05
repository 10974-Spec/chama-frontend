const fs = require('fs');

const TABS = [
    'src/screens/chama/ChamaFeedTab.tsx',
    'src/screens/chama/ChamaWalletTab.tsx',
    'src/screens/chama/ChamaMembersTab.tsx',
    'src/screens/chama/ChamaChatTab.tsx',
    'src/screens/chama/ChamaContributionsTab.tsx',
    'src/screens/chama/ChamaMeetingsTab.tsx',
    'src/screens/chama/ChamaCalendarTab.tsx',
    'src/screens/chama/ChamaVotesTab.tsx',
    'src/screens/chama/ChamaSettingsTab.tsx'
];

TABS.forEach(t => {
   const path = '/home/nyakoe/Desktop/chama/' + t;
   if (fs.existsSync(path)) {
       let code = fs.readFileSync(path, 'utf8');
       
       // Target the destructuring line, replace dynamic themeColor extract with default.
       code = code.replace(/const \{ chamaId,\s*themeColor(?: [^}]*)?\} = route\.params \|\| \{\};/, 'const { chamaId } = route.params || {};\n    const themeColor = \'#2A5C3F\';');
       code = code.replace(/const \{ chamaId,\s*themeColor(?: [^,\}]*)?(,\s*[^}]*)?\} = route\.params \|\| \{\};/g, 'const { chamaId$1 } = route.params || {};\n    const themeColor = \'#2A5C3F\';');
       
       // specifically for forms where it's single
       code = code.replace(/const themeColor = route\.params\?\.themeColor(?: [^;]*)?;/g, "const themeColor = '#2A5C3F';");

       fs.writeFileSync(path, code);
       console.log('Standardized primary color inside', t);
   }
});

