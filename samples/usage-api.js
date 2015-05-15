var docup = require('../');

var markdown = docup({
  // target
  'path': './sample.js',
  // code highlight url, github file url etc.
  'url': 'https://github.com/username/project/blob/master/my.js'
});

console.log(markdown);


var html = docup({
  // target
  'path': './sample.js',
  // code highlight url, github file url etc.
  'url': 'https://github.com/username/project/blob/master/my.js',
  'type' : 'html'
});

console.log(html);