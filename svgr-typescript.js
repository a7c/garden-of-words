module.exports = () => {
    return (code, state) => {
        return `import * as React from "react"\n\n//tslint:disable\n\n` +
               `const ${state.componentName} = (props: any) => ${code}\n\n` +
               `export default ${state.componentName};`;
    }
};
