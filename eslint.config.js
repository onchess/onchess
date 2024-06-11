export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                project: [
                    "./tsconfig.eslint.json",
                    "./packages/*/tsconfig.json",
                ],
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
);
