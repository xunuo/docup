# Docup

Another simple javascript to Markdown/HTML documentation generator (NodeJS).

## Snapshots

![style-default](http://xunuo.com/docup/master/snapshots/style-default.png)

## install

```
npm install docup -g
```

## Usage

- bin  
  
```
docup ./sample.js ./output/sample.html --title=docup --type=html --toc=categories --codeUrl=https://github.com/username/project/blob/master/my.js
```

- api  

```js
var docup = require('docup');

var markdown = docup({
  // path the js file target.
  'path': filepath,
  // [title]
  'title' : 'a js file document',
  // [url] code highlight url, github file url etc.
  'codeUrl': 'https://github.com/username/project/blob/master/my.js',
  // [type] type of output
  'type' : 'html',
  // [toc] type of topic group
  'toc' : 'categories'
});
```

- gulp

    [gulp-docup](https://www.npmjs.com/package/gulp-docup)