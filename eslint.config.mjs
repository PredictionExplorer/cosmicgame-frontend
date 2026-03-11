import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier/flat";

const tsPlugin = nextCoreWebVitals.find(
  (c) => c.name === "next/typescript"
)?.plugins?.["@typescript-eslint"];

const reactHooksPlugin = nextCoreWebVitals.find(
  (c) => c.plugins?.["react-hooks"]
)?.plugins?.["react-hooks"];

const config = [
  ...nextCoreWebVitals,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      ...(tsPlugin ? { "@typescript-eslint": tsPlugin } : {}),
      ...(reactHooksPlugin ? { "react-hooks": reactHooksPlugin } : {}),
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-loss-of-precision": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "@/{components,hooks,lib,utils,contexts,services,config}/**",
              group: "internal",
              position: "after",
            },
            {
              pattern: "@/test-utils",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
        },
      ],
      "react/jsx-no-target-blank": ["error", { allowReferrer: false }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  prettierConfig,
  {
    ignores: [
      ".next/",
      "node_modules/",
      "contracts/types/",
      "public/paint-worklet.js",
      "__mocks__/",
      "playwright-report/",
      "coverage/",
      "commitlint.config.mjs",
    ],
  },
];

export default config;
