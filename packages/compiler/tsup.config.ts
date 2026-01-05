import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli/index.ts"],
  format: ["cjs"],
  dts: true,
  clean: true,
  minify: true,
  outDir: "dist",
});
