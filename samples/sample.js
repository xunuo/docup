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