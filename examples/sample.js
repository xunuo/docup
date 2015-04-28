/**
 * A Sample Propertie
 * @type string|boolean|object
 * @category-
 * @alias-
 * @default true
 * @example
     samplePropertie = true;
 **/
var samplePropertie = true;

/**
 * A Sample Function
 * @param args {object} 入参对象。
 * @param args.arg {string} 第一个参数。
 * @returns {object} 返回对象。
 * @category-
 * @alias-
 * @example
    
    sampleFunction({
        arg : 'Hello world!'
    })
    
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