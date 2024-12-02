import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: 'https://storage.googleapis.com/dby-management-frontend/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
