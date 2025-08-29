import { defineConfig } from 'vite'

export default defineConfig({
  root: 'experiment/simulation',
  server: {
    port: 3000,
    proxy: {
      '/exp1.php': 'http://localhost:8080',
      '/exp1_opt.php': 'http://localhost:8080',
      '/exp1_answer.php': 'http://localhost:8080',
      '/experiment1.php': 'http://localhost:8080'
    }
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true
  }
})