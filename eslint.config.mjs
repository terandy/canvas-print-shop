import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";

// Keep the existing Hooks checks. React Compiler is not enabled in this app;
// adopting its additional rules is a separate change from the Next.js upgrade.
const nextConfig = nextVitals.map((config) => {
  if (!config.rules) return config;

  return {
    ...config,
    rules: Object.fromEntries(
      Object.entries(config.rules).filter(
        ([rule]) =>
          !rule.startsWith("react-hooks/") ||
          rule === "react-hooks/rules-of-hooks" ||
          rule === "react-hooks/exhaustive-deps"
      )
    ),
  };
});

export default defineConfig([
  ...nextConfig,
  prettier,
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);
