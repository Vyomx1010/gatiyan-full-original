import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      '/maps': 'http://localhost:3000', 
      '/users': 'http://localhost:3000', 
      '/contact': 'http://localhost:3000',
      '/payments': 'http://localhost:3000',
      '/captains': 'http://localhost:3000', 
      '/admin-hubhaimere-sepanga-matlena': 'http://localhost:3000', 
    },
  },
});
