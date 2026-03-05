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

    // Remove the injected useTheme & useMemo lines
    c = c.replace(/const \{ colors \} = useTheme\(\);/g, '');
    c = c.replace(/const styles = React\.useMemo\(\(\) => makeStyles\(colors\), \[colors\]\);/g, '');

    // Convert makeStyles back to static styles
    c = c.replace(/const makeStyles = \(colors: any\) => StyleSheet\.create/g, 'const styles = StyleSheet.create');

    // Make sure standard colors is imported if useTheme was used instead
    if (c.includes('useTheme') && !c.includes('import { colors }')) {
        c = c.replace(/import \{ useTheme \} from '[^']+';/, "import { colors } from '../../theme';\nimport { useTheme } from '../../theme/ThemeContext';");
    }

    fs.writeFileSync(f, c);
    console.log('Reverted styling scope in', f);
});
