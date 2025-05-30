import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from 'eslint-plugin-react-hooks';
import {defineConfig} from "eslint/config";

export default defineConfig([
    {
        ignores: ['dist', 'build', 'node_modules', 'public', 'vendor', '*.config.js', '*.config.ts']
    },
    {files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: {js}, extends: ["js/recommended"]},
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        languageOptions: {globals: globals.browser},
        settings: {react: { version: 'detect' }}
    },
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginReact.configs.flat['jsx-runtime'],
    reactHooks.configs['recommended-latest'],
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off"
        }
    },
]);
