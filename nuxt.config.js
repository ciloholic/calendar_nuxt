module.exports = {
  mode: 'spa',
  head: {
    title: 'ReCalendar',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'ReCalendar' }
    ],
    link: [{ rel: 'icon', type: 'image/png', sizes: '32x32', href: 'favicon.png' }]
  },
  css: [
    'element-ui/lib/theme-chalk/reset.css',
    'element-ui/lib/theme-chalk/index.css',
    { src: '@assets/app.scss', lang: 'scss' }
  ],
  plugins: ['@plugins/element-ui.js'],
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
    vendor: ['axios', 'element-ui', 'moment']
  }
}
