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
docup ./sample.js ./output/sample.html --title="sample.js document" --type=html --toc=categories --codeUrl=https://github.com/username/project/blob/master/my.js
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
    
    
## JS Sample

```js
/**
 * A Sample Propertie
 * @type object
 * @category-
 * @alias-
 * @default true
 * @example
     samplePropertie = true;
 **/
var samplePropertie = {
    
    /**
     * Another Propertie in samplePropertie
     * @category samplePropertie
     * @type string
     **/
    inSamplePropertie : 'inner'
    
};

/**
 * Another Propertie
 * @type boolean
 * @category-
 * @alias-
 * @default false
 **/
var anotherPropertie = false;

/**
 * A Sample Function  
 * and with markdown: __Bold Text__
 * @param args {object} 入参对象。
 * @param args.arg {string} 第一个参数 (UTF-8 supported.)。
 * @returns return {object} 返回对象。
 * @returns return.foo {string} 返回foo
 * @returns return.bar {number} 返回bar
 * @category-
 * @alias aliasFunction
 * @example
    
    sampleFunction({
        arg : 'Hello world!'
    })
 
    // returns
    {
      foo : '1',
      bar : 2
    }
    
 **/
var sampleFunction = function(args){
    var arg = args.arg
        ;
    
    var returns = {
        foo : '1',
        bar : 2
    };
    
    return returns; 
    
};

/**
 * aliasFunction
 */
var aliasFunction = function(){
    
}
```