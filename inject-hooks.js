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

    // Regex to find standard React component declarations
    const compRegex = /((?:export\s+(?:default\s+)?)?function\s+[A-Z][A-Za-z0-9_]*\s*\([^)]*\)\s*\{)(?!\s*const \{ colors \} = useTheme\(\);|\s*const styles = React\.useMemo)/g;

    c = c.replace(compRegex, (match, prefix) => {
        return prefix + '\n    const { colors } = useTheme();\n    const styles = React.useMemo(() => makeStyles(colors), [colors]);';
    });

    const arrowCompRegex = /(const\s+[A-Z][A-Za-z0-9_]*\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>\s*\{)(?!\s*const \{ colors \} = useTheme\(\);|\s*const styles = React\.useMemo)/g;

    c = c.replace(arrowCompRegex, (match, prefix) => {
        return prefix + '\n    const { colors } = useTheme();\n    const styles = React.useMemo(() => makeStyles(colors), [colors]);';
    });

    // Since some arrow components might be inline like `const X = () => <View/>`, let's wrap them in a block if they use styles.
    const inlineArrowRegex = /(const\s+[A-Z][A-Za-z0-9_]*\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>\s*)(<[A-Za-z]+[^>]*>[\s\S]*?<\/[A-Za-z]+>|<[A-Za-z]+[^>]*\/>)/g;
    c = c.replace(inlineArrowRegex, (fullMatch, declaration, jsx) => {
        if (jsx.includes('styles.')) {
            return `${declaration} {\n    const { colors } = useTheme();\n    const styles = React.useMemo(() => makeStyles(colors), [colors]);\n    return ${jsx};\n}`;
        }
        return fullMatch;
    });

    fs.writeFileSync(f, c);
    console.log('Injected hooks into', f);
});
