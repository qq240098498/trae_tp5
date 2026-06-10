import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  return {
    plugins: [
      react({
        babel: {
          plugins: isDev ? [
            'react-dev-locator',
          ] : [],
        },
      }),
      traeBadgePlugin({
        variant: 'dark',
        position: 'bottom-right',
        prodOnly: true,
        clickable: true,
        clickUrl: 'https://www.trae.ai/solo?showJoin=1',
        autoTheme: true,
        autoThemeTarget: '#root'
      }),
      tsconfigPaths(),
    ],
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
    server: {
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: env.PORT ? `http://localhost:${env.PORT}` : 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            if (isDev) {
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                console.log('[Dev Proxy]', req.method, req.url);
              });
              proxy.on('proxyRes', (proxyRes, req, _res) => {
                console.log('[Dev Proxy] Response:', proxyRes.statusCode, req.url);
              });
            }
          },
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProd,
      minify: isProd ? 'esbuild' : false,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            icons: ['lucide-react'],
            state: ['zustand'],
          }
        }
      }
    },
    preview: {
      port: 4173,
    }
  };
})
