const fs = require('fs');
const files = [
    'src/components/ui/Avatar.tsx',
    'src/components/ui/Badge.tsx',
    'src/components/ui/Button.tsx',
    'src/components/ui/Card.tsx',
    'src/components/ui/PaymentModal.tsx',
    'src/components/ui/ProgressBar.tsx',
    'src/screens/auth/SplashScreen.tsx',
    'src/screens/chama/ChamaFeedTab.tsx',
    'src/screens/main/ChamaDetailsScreen.tsx',
    'src/screens/main/HomeFeedScreen.tsx',
    'src/screens/main/MyChamasScreen.tsx',
    'src/screens/main/TermsPrivacyScreen.tsx',
    'src/screens/main/WithdrawalScreen.tsx'
];

files.forEach(file => {
    const f = '/home/nyakoe/Desktop/chama/' + file;
    let c = fs.readFileSync(f, 'utf8');

    // Replace `makeStyles.` with `styles.`
    c = c.replace(/makeStyles\./g, 'styles.');

    // Also fix `<View style={makeStyles(colors).something}>` to just use `styles.something` since we now injected `const styles = React.useMemo...`
    c = c.replace(/makeStyles\(colors\)\./g, 'styles.');

    fs.writeFileSync(f, c);
    console.log('Fixed styles scoping in', f);
});
