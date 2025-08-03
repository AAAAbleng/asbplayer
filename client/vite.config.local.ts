import { defineConfig, loadEnv, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { createHtmlPlugin } from 'vite-plugin-html';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Local development configuration - allows opening built files directly
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    const domain = env.VITE_APP_DOMAIN || 'localhost';

    return {
        define: {
            'process.env.VITE_LOCAL_BUILD': JSON.stringify('true'),
        },
        resolve: {
            alias: {
                // 将service worker hook重定向到本地版本
                '../hooks/use-service-worker': '../hooks/use-service-worker-local',
            },
        },
        base: './', // 相对路径，允许直接打开HTML文件
        plugins: [
            react(),
            viteTsconfigPaths(),
            createHtmlPlugin({
                inject: {
                    data: {
                        plausible: '', // 本地开发不需要分析脚本
                        url: `http://${domain}:3000`,
                    },
                },
            }),
            viteStaticCopy({
                targets: [
                    {
                        src: '../common/locales',
                        dest: '',
                    },
                    {
                        src: '../common/assets',
                        dest: '',
                    },
                ],
            }),
            // 移除PWA插件以避免Service Worker问题
        ],
        server: {
            open: true,
            port: 3000,
        },
        build: {
            outDir: 'dist-local', // 输出到不同的目录
            rollupOptions: {
                external: ['virtual:pwa-register'], // 将PWA模块标记为外部依赖
                output: {
                    manualChunks: undefined, // 简化输出，避免代码分割问题
                    entryFileNames: 'assets/[name].js', // 简化文件名
                    chunkFileNames: 'assets/[name].js',
                    assetFileNames: 'assets/[name].[ext]'
                }
            },
            // 确保兼容性
            target: 'es2015',
            minify: false // 便于调试
        }
    };
});
