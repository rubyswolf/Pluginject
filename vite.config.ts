import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
   root: "src",
   base: "./",
   plugins: [react()],
   build: {
      // Keep frontend assets under dist/frontend so electron main can load them in production builds.
      outDir: "../dist/frontend",
      emptyOutDir: true,
   },
});
