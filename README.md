# Docup

Another simple javascript to Markdown/HTML documentation generator.

## Snapshots

![style-default](http://xunuo.com/docup/master/snapshots/style-default.png)

## Usage

```js
var docup = require('docup');

var markdown = docup({
  'path': filepath,
  'url': 'https://github.com/username/project/blob/master/my.js'
});
```