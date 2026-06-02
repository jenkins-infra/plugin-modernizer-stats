import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/plugin-modernizer-stats/',
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'COMMONJS_VARIABLE_IN_ESM') return;
        defaultHandler(warning);
      },
    },
  },
});
