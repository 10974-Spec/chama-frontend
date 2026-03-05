const fs = require('fs');

let t1 = fs.readFileSync('/home/nyakoe/Desktop/chama/src/screens/chama/ChamaMembersTab.tsx', 'utf8');
t1 = t1.replace(/const \{ chamaId \} = route\.params \|\| \{\};/, 'const { chamaId, adminId, inviteCode } = route.params || {};');
fs.writeFileSync('/home/nyakoe/Desktop/chama/src/screens/chama/ChamaMembersTab.tsx', t1);

let t2 = fs.readFileSync('/home/nyakoe/Desktop/chama/src/screens/chama/ChamaWalletTab.tsx', 'utf8');
t2 = t2.replace(/const \{ chamaId \} = route\.params \|\| \{\};/, 'const { chamaId, adminId } = route.params || {};');
fs.writeFileSync('/home/nyakoe/Desktop/chama/src/screens/chama/ChamaWalletTab.tsx', t2);

