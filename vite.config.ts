import { defineConfig } from 'vite'

// Le jeu est servi tel quel par un Worker Cloudflare (issue #12) : un build statique dans dist/.
export default defineConfig({
  build: {
    target: 'es2022',
    // three.js seul pèse ~560 ko (140 ko compressé) : c'est attendu, inutile d'avertir.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      // three.js est gros : on le met dans son propre fichier pour que le cache du navigateur le garde entre deux versions du jeu.
      output: { manualChunks: (id) => (id.includes('node_modules/three') ? 'three' : undefined) },
    },
  },
})
