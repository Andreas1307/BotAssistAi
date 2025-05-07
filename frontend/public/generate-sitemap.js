const sitemap = require('sitemap');
const fs = require('fs');

const sm = sitemap.createSitemap({
  hostname: 'https://www.botassistai.com',
  urls: [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/features', changefreq: 'weekly', priority: 0.8 },
    { url: '/pricing', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
    // Add more URLs as needed
  ],
});

fs.writeFileSync('./public/sitemap.xml', sm.toString());
console.log('✅ sitemap.xml generated in /public folder');
