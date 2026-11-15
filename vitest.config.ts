import { defineConfig } from 'vitest/config'

// Les tests visent la simulation (src/sim) et les données (src/data) : ils tournent dans Node, sans navigateur ni Phaser.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
