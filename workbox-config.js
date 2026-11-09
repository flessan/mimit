module.exports = {
  globDirectory: 'dist',
  globPatterns: ['**/*.{html,js,css,png,svg,jpg,jpeg,gif,webp,avif,bmp,json,ttf,otf,woff,woff2,eot,ico,webmanifest,map}'],
  swDest: 'dist/service-worker.js',
  clientsClaim: true,
  skipWaiting: true
};
