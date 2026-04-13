const { fetchAllNews } = require('./news-fetcher');

fetchAllNews().then(function(news) {
  console.log('Found: ' + news.length + ' articles');
  news.slice(0, 5).forEach(function(a, i) {
    console.log((i + 1) + '. [' + a.category + '] ' + a.title.substring(0, 70));
  });
}).catch(function(e) {
  console.error('Error:', e.message);
});
