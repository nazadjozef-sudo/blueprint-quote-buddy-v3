import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  root: './blueprint-quote-buddy-v3',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './blueprint-quote-buddy-v3/src'),
    },
  },
});
