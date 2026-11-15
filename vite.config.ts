import { defineConfig } from 'vite'

// Le jeu est servi tel quel par un Worker Cloudflare (issue #12) : un build statique dans dist/.
export default defineConfig({
  build: {
    target: 'es2022',
    // Phaser seul pèse ~1,2 Mo (320 ko compressé) : c'est attendu, inutile d'avertir.
    chunkSizeWarningLimit: 1300,
    // Phaser est gros : on le met dans son propre fichier pour que le cache du navigateur le garde entre deux versions du jeu.
    rollupOptions: { output: { manualChunks: (id) => (id.includes('node_modules/phaser') ? 'phaser' : undefined) } },
  },
})
