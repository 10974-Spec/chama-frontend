const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const dir = '/home/nyakoe/Desktop/chama/src/screens';

function walkDir(d, callback) {
  fs.readdirSync(d).forEach(f => {
    let dirPath = path.join(d, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(d, f));
  });
}

const files = [];
walkDir(dir, f => {
  if (f.endsWith('.tsx')) files.push(f);
});

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes('StyleSheet.create')) return;
  if(code.includes('makeStyles')) return; // Already converted

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    let hasStyles = false;
    let mainComponent = null;

    traverse(ast, {
      VariableDeclarator(path) {
        // Find const styles = StyleSheet.create(...)
        if (
          path.node.id.name === 'styles' &&
          path.node.init &&
          path.node.init.type === 'CallExpression' &&
          path.node.init.callee.type === 'MemberExpression' &&
          path.node.init.callee.object.name === 'StyleSheet' &&
          path.node.init.callee.property.name === 'create'
        ) {
          hasStyles = true;
          // Change to const makeStyles = (colors: any) => StyleSheet.create(...)
          path.node.id.name = 'makeStyles';
          const colorsParam = t.identifier('colors');
          colorsParam.typeAnnotation = t.tsTypeAnnotation(t.tsAnyKeyword());
          path.node.init = t.arrowFunctionExpression(
            [colorsParam],
            path.node.init
          );
        }
      },
      FunctionDeclaration(path) {
        if (path.parent.type === 'ExportDefaultDeclaration' || path.parent.type === 'ExportNamedDeclaration') {
           mainComponent = path;
        } else if (path.node.id && /^[A-Z]/.test(path.node.id.name)) {
           if (!mainComponent) mainComponent = path;
        }
      },
      VariableDeclarator(path) {
         if (path.node.id && /^[A-Z]/.test(path.node.id.name) && path.node.init && (path.node.init.type === 'ArrowFunctionExpression' || path.node.init.type === 'FunctionExpression')) {
            if(!mainComponent) mainComponent = path.get('init');
         }
      }
    });

    if (hasStyles && mainComponent) {
      // We need to inject `const styles = makeStyles(colors);` into the body of mainComponent
      const body = mainComponent.node.body || mainComponent.node.value.body;
      if (body && body.type === 'BlockStatement') {
        // Check if `const { colors } = useTheme();` exists
        let hasUseTheme = false;
        body.body.forEach(stmt => {
           if (stmt.type === 'VariableDeclaration') {
              stmt.declarations.forEach(decl => {
                 if (decl.init && decl.init.type === 'CallExpression' && decl.init.callee.name === 'useTheme') {
                    hasUseTheme = true;
                 }
              });
           }
        });

        // Inject statement
        const injection = t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('styles'),
            t.callExpression(t.identifier('makeStyles'), [t.identifier('colors')])
          )
        ]);

        // Insert after useTheme if it exists, else at top
        let inserted = false;
        for (let i = 0; i < body.body.length; i++) {
           const stmt = body.body[i];
           if (stmt.type === 'VariableDeclaration') {
             let isUseTheme = false;
             stmt.declarations.forEach(d => {
               if (d.init && d.init.type === 'CallExpression' && d.init.callee.name === 'useTheme') isUseTheme = true;
             });
             if (isUseTheme) {
               body.body.splice(i + 1, 0, injection);
               inserted = true;
               break;
             }
           }
        }
        if (!inserted) {
           body.body.unshift(injection);
        }

        const output = generate(ast, {}, code);
        fs.writeFileSync(file, output.code);
        console.log('Processed:', file);
      }
    }
  } catch (e) {
    console.error('Error in', file, e.message);
  }
});
