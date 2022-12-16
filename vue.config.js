const SitemapPlugin = require('sitemap-webpack-plugin').default
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const paths = [
  {
      path: '/',
      lastmod: new Date().toISOString().slice(0,10),
      priority: 1.0,
      changefreq: 'weekly'
  },
  {
      path: '/search',
      lastmod: new Date().toISOString().slice(0,10),
      priority: 0.9,
      changefreq: 'weekly'
  },
  {
      path: '/channel',
      lastmod: new Date().toISOString().slice(0,10),
      priority: 0.9,
      changefreq: 'weekly'
  },
  {
      path: '/trending',
      lastmod: new Date().toISOString().slice(0,10),
      priority: 0.8,
      changefreq: 'weekly'
  },
]
module.exports = {
  configureWebpack: {
    plugins: [
      new SitemapPlugin({ base: 'https://cctwitch.xyz', paths }),
      // new BundleAnalyzerPlugin()
    ]
  },
  transpileDependencies: [
    'vuetify',
  ],
  pwa:{
    manifestOptions:{
      "background_color": "#9ea8da",
      "description": "Twitch Clip Download, Search and Collect easily. CCTwitch provide various sort of clips by keyword, date, vids. Also can save, download clips. CCTwitch는 트위치 클립 검색, 다운, 저장 및 다양한 정렬을 제공합니다.",
      "dir": "ltr",
      "display": "standalone",
      "name": "CCTwitch - Twitch Clip Collector",
      "orientation": "portrait",
      "scope": "/",
      "short_name": "CCTwitch",
      "start_url": "/",
      "theme_color": "#9ea8da",
      "icons": [
        {
          "src": "/img/icons/monochrome_96x96_reverse.png",
          "type": "image/png",
          "sizes": "96x96",
          "purpose": "monochrome",
        },
        {
          "src": "/img/icons/192x192.webp",
          "type": "image/webp",
          "sizes": "192x192",
          "purpose": "any maskable",
        },
        {
          "src": "/img/icons/256x256.webp",
          "type": "image/webp",
          "sizes": "256x256",
          "purpose": "any maskable",
        },
        {
          "src": "/new_logo.png",
          "type": "image/png"
        }
      ]
    }
  }
};
