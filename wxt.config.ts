import { defineConfig } from 'wxt'
import svgr from 'vite-plugin-svgr'
import removeConsole from 'vite-plugin-remove-console'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  modules: ['@wxt-dev/module-react', '@wxt-dev/i18n/module'],
  srcDir: 'src',
  vite: (configEnv) => ({
    plugins: [
      svgr(),
      configEnv.mode === 'production' ? removeConsole({ includes: ['log'] }) : undefined,
      process.env.ANALYZE === 'true'
        ? visualizer({
            open: true,
            filename: '.output/stats.html',
            gzipSize: true,
            brotliSize: true,
          })
        : undefined,
    ].filter(Boolean),
    esbuild: {
      charset: 'ascii',
    },
  }),
  manifest: () => {
    const version = process.env.RELEASE_VERSION || require('./package.json').version

    return {
      name: 'ChatCanves',
      version,
      default_locale: 'en',
      permissions: ['storage'],
      web_accessible_resources: [
        {
          resources: ['theme-sync-main-world.js', 'icon/512.png'],
          matches: ['*://gemini.google.com/*'],
        },
      ],
    }
  },
})
