const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs');
const path = require('path');

// Create a write stream to output the sitemap.xml file
const writeStream = fs.createWriteStream(path.join(__dirname, 'public', 'sitemap.xml'));

// Initialize SitemapStream
const sitemap = new SitemapStream({ hostname: 'https://www.botassistai.com' });

// Pipe the sitemap stream to the write stream
sitemap.pipe(writeStream);

// Add your URLs here
sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
sitemap.write({ url: '/features', changefreq: 'weekly', priority: 0.8 });
sitemap.write({ url: '/pricing', changefreq: 'monthly', priority: 0.7 });
sitemap.write({ url: '/about', changefreq: 'monthly', priority: 0.6 });
sitemap.write({ url: '/contact', changefreq: 'monthly', priority: 0.6 });
sitemap.write({ url: '/log-in', changefreq: 'monthly', priority: 0.7 });
sitemap.write({ url: '/sign-up', changefreq: 'monthly', priority: 0.7 });


// Finalize the sitemap
sitemap.end();

// Log when the sitemap has been generated
writeStream.on('finish', () => {
  console.log('✅ sitemap.xml generated in /public folder');
});
