import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_TARGET || 'https://qa-simplifyqa.devopsark.com';
  const proxy = {
    target,
    changeOrigin: true,
    configure: (server) => {
      server.on('proxyReq', (proxyReq) => { proxyReq.removeHeader('origin'); });
    }
  };
  return {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: { port: 4201, proxy: { '/pm': proxy, '/dashboard': proxy } }
  };
});
