import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackStart(),
    viteTsConfigPaths(),
    tailwindcss(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});
