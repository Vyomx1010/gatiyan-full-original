import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      '/api': 'https://gatiyan-full-original.vercel.app',
      '/users': 'https://gatiyan-full-original.vercel.app',
      '/captains': 'https://gatiyan-full-original.vercel.app',
      '/maps': 'https://gatiyan-full-original.vercel.app', 
      '/rides': 'https://gatiyan-full-original.vercel.app', 
      '/payments': 'https://gatiyan-full-original.vercel.app',
      '/admin-hubhaimere-sepanga-matlena': 'https://gatiyan-full-original.vercel.app', 
      '/contact': 'https://gatiyan-full-original.vercel.app', 
    },
  },
});
