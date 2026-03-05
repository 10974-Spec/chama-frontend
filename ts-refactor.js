const { Project, SyntaxKind } = require('ts-morph');
const project = new Project();
project.addSourceFilesAtPaths("/home/nyakoe/Desktop/chama/src/**/*.tsx");

const files = project.getSourceFiles();

files.forEach(sourceFile => {
    let hasChanges = false;

    // 1. Find standard `const styles = StyleSheet.create({...})`
    const stylesDecl = sourceFile.getVariableDeclaration('styles');
    if (!stylesDecl) return;

    const initializer = stylesDecl.getInitializer();
    if (!initializer || initializer.getKind() !== SyntaxKind.CallExpression) return;

    const callee = initializer.getExpression();
    if (callee.getText() !== 'StyleSheet.create') return;

    // Change to `const makeStyles = (colors: any) => StyleSheet.create({...})`
    stylesDecl.rename('makeStyles');
    initializer.replaceWithText(`(colors: any) => ${initializer.getText()}`);
    hasChanges = true;

    // 2. Identify React components. Usually ExportDefault or ExportNamed with PascalCase
    const functions = [...sourceFile.getFunctions(), ...sourceFile.getVariableDeclarations().filter(v =>
        v.getInitializer() && (v.getInitializer().getKind() === SyntaxKind.ArrowFunction || v.getInitializer().getKind() === SyntaxKind.FunctionExpression)
    )];

    let importedUseTheme = false;

    functions.forEach(func => {
        const name = func.getName?.() || func.getName();
        // Check if it's a PascalCase component
        if (!name || !/^[A-Z]/.test(name)) return;

        // Check if the component text contains 'styles.' to avoid unnecessary injection
        let body;
        if (func.getKind() === SyntaxKind.FunctionDeclaration) {
            body = func.getBody();
        } else {
            body = func.getInitializer().getBody();
        }
        if (!body || !body.getText().includes('styles.')) return;

        // Inject hooks inside BlockStatement
        if (body.getKind() === SyntaxKind.Block) {
            if (!body.getText().includes('useTheme(')) {
                body.insertStatements(0, 'const styles = React.useMemo(() => makeStyles(colors), [colors]);');
                body.insertStatements(0, 'const { colors } = useTheme();');
                importedUseTheme = true;
            }
        }
    });

    if (importedUseTheme) {
        // Ensure useTheme is imported
        const hasImport = sourceFile.getImportDeclarations().some(imp => imp.getModuleSpecifierValue().includes('ThemeContext'));
        if (!hasImport) {
            // Calculate depth
            const filePath = sourceFile.getFilePath();
            const depth = filePath.split('/').length - 7; // /home/nyakoe/Desktop/chama/src/...
            let prefix = depth === 0 ? './' : depth === 1 ? '../' : depth === 2 ? '../../' : '../../../';
            if (filePath.includes('/components/ui/')) prefix = '../../';

            sourceFile.addImportDeclaration({
                namedImports: ['useTheme'],
                moduleSpecifier: `${prefix}theme/ThemeContext`
            });
        }

        // Ensure React is imported
        const hasReact = sourceFile.getImportDeclarations().some(imp => imp.getModuleSpecifierValue() === 'react');
        if (!hasReact) {
            sourceFile.addImportDeclaration({
                defaultImport: 'React',
                moduleSpecifier: 'react'
            });
        }
    }

    if (hasChanges) {
        sourceFile.saveSync();
        console.log('Refactored AST for:', sourceFile.getBaseName());
    }
});

console.log('AST Refactor Complete');
