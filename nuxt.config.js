require('dotenv').config()

module.exports = {
  mode: 'ssr',
  head: {
    title: 'Top',
    titleTemplate: 'ReCalendar | %s',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'ReCalendar' }
    ],
    link: [{ rel: 'icon', type: 'image/png', sizes: '32x32', href: 'favicon.png' }]
  },
  css: ['element-ui/lib/theme-chalk/reset.css', 'element-ui/lib/theme-chalk/index.css', { src: '~/assets/app.scss', lang: 'scss' }],
  loading: '~/components/TheLoading.vue',
  router: { middleware: 'auth' },
  plugins: ['~/plugins/element-ui.js'],
  modules: ['@nuxtjs/dotenv'],
  build: {
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    vendor: ['element-ui', 'firebase', 'moment', 'uuid', 'vuexfire']
  }
}
