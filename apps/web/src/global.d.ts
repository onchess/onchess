// Ambient declaration for side-effect CSS imports (e.g.
// `import "@mantine/core/styles.css"`). TypeScript 6 errors on side-effect
// imports of files it can't resolve a type declaration for; Next handles the
// actual bundling. `*.module.css` is left to Next's own typed declarations.
declare module "*.css";
