const SitemapPlugin = require('sitemap-webpack-plugin').default
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
        new SitemapPlugin({ base: 'https://cctwitch.xyz', paths })
    ]
  },
  transpileDependencies: [
    'vuetify',
  ],
  pwa:{
    manifestOptions:{
      "background_color": "#ffffff",
      "description": "Twitch Clip Download, Search and Collect easily. CCTwitch provide various sort of clips by keyword, date, vids. Also can save, download clips. CCTwitch는 트위치 클립 검색, 다운, 저장 및 다양한 정렬을 제공합니다.",
      "dir": "ltr",
      "display": "standalone",
      "name": "CCTwitch - Clip Collector",
      "orientation": "portrait",
      "scope": "/",
      "short_name": "CCTwitch",
      "start_url": "/",
      "theme_color": "#9ea8da",
      "icons": [
        {
          "src": "/img/icons/100x100.png",
          "type": "image/png",
          "sizes": "100x100",
          "purpose": "any maskable",
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
          "src": "/img/icons/384x384.webp",
          "type": "image/webp",
          "sizes": "384x384",
          "purpose": "any maskable",
        },
        {
          "src": "/img/icons/512x512.webp",
          "type": "image/webp",
          "sizes": "512x512",
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
