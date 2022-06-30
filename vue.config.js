module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  pwa:{
    manifestOptions:{
      "background_color": "#ffffff",
      "description": "CCTwitch can make you search streamers and collect clips easily. Can save and download clips.",
      "dir": "ltr",
      "display": "standalone",
      "name": "cctwitch",
      "orientation": "portrait",
      "scope": "/",
      "short_name": "cctwitch",
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
