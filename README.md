# Docup

Another simple javascript to Markdown/HTML documentation generator.

## Snapshots

![style-default](http://xunuo.com/docup/master/snapshots/style-default.png)

## Usage

```js
var docup = require('docup');

var markdown = docup({
  // target
  'path': filepath,
  // code highlight url, github file url etc.
  'url': 'https://github.com/username/project/blob/master/my.js'
});
```

> more in samples/run.sh :)