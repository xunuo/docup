# docup v0.0.1

A simple javascript to Markdown/HTML documentation generator.

## Usage

```js
var docup = require('docup');

var markdown = docup({
  'path': filepath,
  'url': 'https://github.com/username/project/blob/master/my.js'
});
```