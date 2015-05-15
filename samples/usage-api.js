var docup = require('../'),
    path = require('path'),
    fs = require('fs')
    ;

var html = docup({
  // target
  'path': './sample.js',
  // title
  'title': 'sample.js docup html from api',
  // code highlight url, github file url etc.
  'codeUrl': 'https://github.com/username/project/blob/master/my.js',
  // type of output
  'type' : 'html',
  // type of topic group
  'toc' : 'categories'
});

console.log(html);

outputFile = path.join(process.cwd(), './output/sample.html');

fs.writeFileSync(outputFile, html, 'utf-8');


// This is for markdown

//var markdown = docup({
//  // target
//  'path': './sample.js',
//  // code highlight url, github file url etc.
//  'url': 'https://github.com/username/project/blob/master/my.js'
//});
//
//console.log(markdown);
//outputFile = path.join(process.cwd(), './output/sample.md');
//fs.writeFileSync(outputFile, markdown, 'utf-8');
