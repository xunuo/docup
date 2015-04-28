'use strict';

var _ = require('lodash'),
    os = require('os'),
    Alias = require('./alias.js'),
    util = require('./util.js');

/*----------------------------------------------------------------------------*/

function cleanValue(string) {
  string = string == null ? '' : (string + '');
  return _.trim(string.replace(/(?:^|\n)[\t ]*\*[\t ]*/g, ' '));
}

function getMultilineValue(string, tagName) {
  var prelude = tagName == 'description' ? '^ */\\*\\*(?: *\\n *\\* *)?' : ('^ *\\*[\\t ]*@' + _.escapeRegExp(tagName) + '\\b'),
      postlude = '(?=\\*\\s+\\@[a-z]|\\*/)',
      result = _.result(RegExp(prelude + '([\\s\\S]*?)' + postlude, 'gm').exec(string), 1, '');

    
  result = _.trim(result.replace(RegExp('(?:^|\\n)[\\t ]*\\*[\\t ]' + (tagName == 'example' ? '?' : '*'), 'g'), '\n'));
    
    
  // pretty tabs
  var 
      lineArray = result.split('\n'),
      endLineContent = lineArray[lineArray.length-1]
      ;
    
    
  // get beginningTab content
  var lineBeginningTab = endLineContent.match(/^[\s]*/g);
    
  if(lineBeginningTab) {
      // replace beginningTab to empty
      var replaceRegx = new RegExp('\n' + lineBeginningTab[0], 'g')
          ;
      result = result.replace(replaceRegx, '\n');
  }
    
  return result;
    
}

function getValue(string, tagName) {
  tagName = tagName == 'member' ? (tagName + '(?:Of)?') : _.escapeRegExp(tagName);
  var result = _.result(RegExp('^ *\\*[\\t ]*@' + tagName + '\\s+(.+)', 'm').exec(string), 1, '');
  return cleanValue(result);
}

function hasTag(string, tagName) {
  tagName = tagName == '*' ? '\\w+' : _.escapeRegExp(tagName);
  return RegExp('^ *\\*[\\t ]*@' + tagName + '\\b', 'm').test(string);
}



/*----------------------------------------------------------------------------*/

/**
 * The Entry constructor.
 *
 * @constructor
 * @param {string} entry The documentation entry to analyse.
 * @param {string} source The source code.
 * @param {string} [lang='js'] The language highlighter used for code examples.
 */
function Entry(entry, source, lang) {
  this.entry = entry;
  this.lang = lang == null ? 'js' : lang;
  this.source = source.replace(os.EOL, '\n');
  this.getCall = _.memoize(getCall);
  this.getCategory = _.memoize(getCategory);
  this.getDesc = _.memoize(getDesc);
  this.getExample = _.memoize(getExample);
  this.isAlias = _.memoize(isAlias);
  this.isCtor = _.memoize(isCtor);
  this.isFunction = _.memoize(isFunction);
  this.isLicense = _.memoize(isLicense);
  this.isPlugin = _.memoize(isPlugin);
  this.isPrivate = _.memoize(isPrivate);
  this.isStatic = _.memoize(isStatic);
  this.getLineNumber = _.memoize(getLineNumber);
  this.getName = _.memoize(getName);
  this.getReturns = _.memoize(getReturns);
  this.getType = _.memoize(getType);
  this._aliases = this._members = this._params = undefined;
}

/**
 * Extracts the documentation entries from source code.
 *
 * @static
 * @memberOf Entry
 * @param {string} source The source code.
 * @returns {Array} The array of entries.
 */
function getEntries(source) {
  source = source == null ? '' : (source + '');
  return source.match(/\/\*\*(?![-!])[\s\S]*?\*\/\s*.+/g) || [];
}

/**
 * Extracts the entry's `alias` objects.
 *
 * @memberOf Entry
 * @param {number} index The index of the array value to return.
 * @returns {Array|string} The entry's `alias` objects.
 */
function getAliases(index) {
  if (this._aliases === undefined) {
    var result = _.result(/\*[\t ]*@alias\s+(.+)/.exec(this.entry), 1);
    if (result) {
      result = result.replace(/(?:^|\n)[\t ]*\*[\t ]*/, ' ').trim();
      result = result.split(/,\s*/);
      result.sort(util.compareNatural);

      result = _.map(result, function(value) {
        return new Alias(value, this);
      }, this);
    }
    this._aliases = result;
  }
  return index != null
    ? this._aliases[index]
    : this._aliases;
}

/**
 * Extracts the function call from the entry.
 *
 * @memberOf Entry
 * @returns {string} The function call.
 */
function getCall() {
  var result = /\*\/\s*(?:function\s+([^(]*)|(.*?)(?=[:=,]))/.exec(this.entry);
  if (result) {
    result = (result[1] || result[2]).split('.').pop();
    result = _.trim(_.trim(result), "'").split('var ').pop();
    result = _.trim(result);
  }
  // Get the function name.
  // Avoid `this.getName()` because it calls `this.getCall()`.
  var name = _.result(/\*[\t ]*@name\s+(.+)/.exec(this.entry), 1, result || '');
  if (!this.isFunction()) {
    return name;
  }
  var params = this.getParams(),
      paramNames = [];

  // Compile the function call syntax.
  result = [result];
  _.each(params, function(param) {
    var paramValue = param[1],
        parentParam = _.result(/\w+(?=\.[\w.]+)/.exec(paramValue), 0);

    var parentIndex = parentParam == null ? -1 : _.findIndex(params, function(param) {
      return _.trim(param[1], '[]') == parentParam;
    });

    // Skip params that are properties of other params (e.g. `options.leading`).
    if (_.result(params[parentIndex], 0) != 'object') {
      result.push(paramValue);
    }
    paramNames.push(_.trim(paramValue, '[]'));
  });

  // Format the function call.
  return name + '(' + result.slice(1).join(', ') + ')';
}

/**
 * Extracts the entry's `category` data.
 *
 * @memberOf Entry
 * @returns {string} The entry's `category` data.
 */
function getCategory() {
  var result = _.result(/\*[\t ]*@category\s+(.+)/.exec(this.entry), 1, '');
  return result
    ? cleanValue(result)
    : (this.getType() == 'Function' ? 'Methods' : 'Properties');
}

/**
 * Extracts the entry's description.
 *
 * @memberOf Entry
 * @returns {string} The entry's description.
 */
function getDesc() {
  var result = getMultilineValue(this.entry, 'description');
  if (!result) {
    return result;
  }
  result = _.trim(result
    .replace(/:\n(?=[\t ]*\S)/g, ':<br>\n')
    .replace(/(?:^|\n)[\t ]*\*\n[\t ]*\*[\t ]*/g, '\n\n')
    .replace(/(?:^|\n)[\t ]*\*[\t ]/g, ' ')
    .replace(/\n( *)[-*](?=[\t ]+\S)/g, '\n<br>\n$1*')
    .replace(/^[\t ]*\n/gm, '<br>\n<br>\n')
  );

  var type = this.getType();

  if (type != 'unknown') {
    result = (type == 'Function' ? '' : '(' + type.replace(/\|/g, ', ') + '): ') + result;
  }
  return result;
}

/**
 * Extracts the entry's `example` data.
 *
 * @memberOf Entry
 * @returns {string} The entry's `example` data.
 */
function getExample() {
  var result = getMultilineValue(this.entry, 'example');
  if (result) {
    result = '```' + this.lang + '\n' + result + '\n```';
  }
  return result;
}

/**
 * Checks if the entry is an alias.
 *
 * @memberOf Entry
 * @returns {boolean} Returns `false`.
 */
function isAlias() {
  return false;
}

/**
 * Checks if the entry is a constructor.
 *
 * @memberOf Entry
 * @returns {boolean} Returns `true` if a constructor, else `false`.
 */
function isCtor() {
  return hasTag(this.entry, 'constructor');
}

/**
 * Checks if the entry is a function reference.
 *
 * @memberOf Entry
 * @returns {boolean} Returns `true` if the entry is a function reference, else `false`.
 */
function isFunction() {
  return !!(
    this.isCtor() ||
    _.size(this.getParams()) ||
    _.size(this.getReturns()) ||
    /\*[\t ]*@function\b/.test(this.entry) ||
    /\*\/\s*function/.test(this.entry)
  );
}

/**
 * Checks if the entry is a license.
 *
 * @memberOf Entry
 * @returns {boolean} Returns `true` if a license, else `false`.
 */
function isLicense() {
  return hasTag(this.entry, 'license');
}

/**
 * Checks if the entry *is* assigned to a prototype.
 *
 * @memberOf Entry
 * @returns {boolean} Returns `true` if assigned to a prototype, else `false`.
 */
function isPlugin() {
  return (
    (!this.isCtor()) &&
    (!this.isPrivate()) &&
    (!this.isStatic())
  );
}

/**
 * Checks if the entry is private.
 *
 * @memberOf Entry
 * @returns {boolean} Returns `true` if private, else `false`.
 */
function isPrivate() {
  return (
    this.isLicense() ||
    hasTag(this.entry, 'private') ||
    !hasTag(this.entry, '*')
  );
}

/**
 * Checks if the entry is *not* assigned to a prototype.
 *
 * @memberOf Entry
 * @returns {boolean} Returns `true` if not assigned to a prototype, else `false`.
 */
function isStatic() {
  var isPublic = !this.isPrivate(),
      result = isPublic && hasTag(this.entry, 'static');

  // Get the result in cases where it isn't explicitly stated.
  if (isPublic && !result) {
    var parent = _.last((this.getMembers(0) || '').split(/[#.]/));
    if (!parent) {
      return true;
    }
    var source = this.source;
    _.each(getEntries(source), function(entry) {
      entry = new Entry(entry, source);
      if (entry.getName() == parent) {
        result = !entry.isCtor();
        return false;
      }
    });
  }
  return result;
}

/**
 * Resolves the entry's line number.
 *
 * @memberOf Entry
 * @returns {number} The entry's line number.
 */
function getLineNumber() {
  var entry = this.entry,
      lines = this.source.slice(0, this.source.indexOf(entry) + entry.length).match(/\n/g).slice(1);

  // Offset by 2 because the first line number is before a line break and the
  // last line doesn't include a line break.
  return lines.length + 2;
}

/**
 * Extracts the entry's `member` data.
 *
 * @memberOf Entry
 * @param {number} [index] The index of the array value to return.
 * @returns {Array|string} The entry's `member` data.
 */
function getMembers(index) {
  if (this._members === undefined) {
    var result = getValue(this.entry, 'member');
    if (result) {
      result = result.split(/,\s*/);
      result.sort(util.compareNatural);
    }
    this._members = result || [];
  }
  return index != null
    ? this._members[index]
    : this._members;
}

/**
 * Extracts the entry's `name` data.
 *
 * @memberOf Entry
 * @returns {string} The entry's `name` data.
 */
function getName() {
  var result = hasTag(this.entry, 'name')
    ? getValue(this.entry, 'name')
    : _.first(this.getCall().split('('));

  return (result || '').replace(/\'/g, '');
}

/**
 * Extracts the entry's `param` data.
 *
 * @memberOf Entry
 * @param {number} [index] The index of the array value to return.
 * @returns {Array} The entry's `param` data.
 */
function getParams(index) {
  if (this._params === undefined) {
    var match,
        re = /@param\s+\{\(?([^})]+)\)?\}\s+(\[.+\]|[\.\w]+(?:\[.+\])?)\s+([\s\S]*?)(?=\@|\*)/gim,
        result = [];

    while (match = re.exec(this.entry)) {
      match = match.slice(1);
      match = match.map(function(aParamPart,index) {
        return aParamPart.trim()
      });
      match[2] = match[2].replace(/(?:^|\n)[\t ]*\*[\t ]*/g, ' ');
      result.push(match);
    }
    var tuples = match ? _.compact(match) : [];
    _.each(tuples, function(tuple){
      result.push(tuple.trim());
    });

    // for '@param paramItemName {string} paramDescription'
    var match2,
        re2 = /@param\s+(\[.+\]|[\.\w]+(?:\[.+\])?)\s+\{\(?([^})]+)\)?\}\s+([\s\S]*?)(?=\@|\*)/gim
        ;
    while (match2 = re2.exec(this.entry)) {
      match2 = match2.slice(1);
      match2 = match2.map(function(aParamPart,index) {
        return aParamPart.trim()
      });
      match2[2] = match2[2].replace(/(?:^|\n)[\t ]*\*[\t ]*/g, ' ');

      // adapter
      var paramType = match2[1],
          paramName = match2[0]
          ;
      match2[0] = paramType;
      match2[1] = paramName;
      result.push(match2);
    }

    var tuples2 = match2 ? _.compact(match2) : [];
    _.each(tuples2, function(tuple){
      result.push(tuple.trim());
    });

    this._params = result;
  }
  return index !== undefined
    ? this._params[index]
    : this._params;
}

/**
 * Extracts the entry's `returns` data.
 *
 * @memberOf Entry
 * @returns {array} The entry's `returns` data.
 */
function getReturns() {

    var match,
        re = /@returns\s+\{\(?([^})]+)\)?\}\s+(\[.+\]|[\.\w]+(?:\[.+\])?)\s+([\s\S]*?)(?=\@|\*)/gim,
        result = [];

    while (match = re.exec(this.entry)) {
      match = match.slice(1);
      match = match.map(function(aReturnPart,index) {
        return aReturnPart.trim()
      });
      match[2] = match[2].replace(/(?:^|\n)[\t ]*\*[\t ]*/g, ' ');
      result.push(match);
    }


    // for '@returns paramItemName {string} paramDescription'
    var match2,
        re2 = /@returns\s+(\[.+\]|[\.\w]+(?:\[.+\])?)\s+\{\(?([^})]+)\)?\}\s+([\s\S]*?)(?=\@|\*)/gim
        ;
    while (match2 = re2.exec(this.entry)) {
      match2 = match2.slice(1);
      match2 = match2.map(function(aReturnPart,index) {
        return aReturnPart.trim()
      });
      match2[2] = match2[2].replace(/(?:^|\n)[\t ]*\*[\t ]*/g, ' ');

      // adapter
      var returnType = match2[1],
          returnName = match2[0]
          ;
      match2[0] = returnType;
      match2[1] = returnName;
      result.push(match2);
    }

    return result;



  //var result = getMultilineValue(this.entry, 'returns'),
  //    returnType = _.result(/(?:\{)([\w|\*]*)(?:\})/gi.exec(result),1);
  //
  //
  //
  //return returnType
  //  ? [returnType, result.replace(/(\{[\w|\*]*\})/gi,'')]
  //  : [];
}

/**
 * Extracts the entry's `type` data.
 *
 * @memberOf Entry
 * @returns {string} The entry's `type` data.
 */
function getType() {
  var result = getValue(this.entry, 'type');
  if (result) {
    if (/^(?:array|function|object|regexp)$/.test(result)) {
      result = _.capitalize(result);
    }
  } else {
    result = this.isFunction() ? 'Function' : 'unknown';
  }
  return result;
}

/**
 * Extracts the entry's hash value for permalinking.
 *
 * @memberOf Entry
 * @param {string} [style] The hash style.
 * @returns {string} The entry's hash value (without a hash itself).
 */
function getHash(style) {
  var result = this.getMembers(0) || '';

  switch (style) {
    case 'github':
      if (result) {
        result += this.isPlugin() ? 'prototype' : '';
      }
      result += this.getCall();
      return result
        .replace(/\(\[|\[\]/g, '')
        .replace(/[\t =|\'"{}.()\]]/g, '')
        .replace(/[\[#,]+/g, '-')
        .toLowerCase();

    case 'default':
    default:
      if (result) {
        result += '-' + (this.isPlugin() ? 'prototype-' : '');
      }
      result += this.isAlias() ? this.getOwner().getName() : this.getName();
      return result
        .replace(/\./g, '-')
        .replace(/^_-/, '');
  }
}

/*----------------------------------------------------------------------------*/

Entry.getEntries = getEntries;

_.assign(Entry.prototype, {
  'getAliases': getAliases,
  'getCall': getCall,
  'getCategory': getCategory,
  'getDesc': getDesc,
  'getExample': getExample,
  'isAlias': isAlias,
  'isCtor': isCtor,
  'isFunction': isFunction,
  'isLicense': isLicense,
  'isPlugin': isPlugin,
  'isPrivate': isPrivate,
  'isStatic': isStatic,
  'getLineNumber': getLineNumber,
  'getMembers': getMembers,
  'getName': getName,
  'getParams': getParams,
  'getReturns': getReturns,
  'getType': getType,
  'getHash': getHash
});

module.exports = Entry;