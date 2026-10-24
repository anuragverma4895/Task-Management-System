import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const frontendDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(frontendDir, "..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repositoryRoot, "");
  return {
    root: frontendDir,
    envDir: repositoryRoot,
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      proxy: env.VITE_API_PROXY ? { "/api": { target: env.VITE_API_PROXY, changeOrigin: true } } : undefined
    },
    build: { outDir: "dist", emptyOutDir: true }
  };
});
