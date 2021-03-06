/*!
 * docup v0.2.0
 * Available under MIT license <http://mths.be/mit>
 */
'use strict';

var _ = require('lodash'),
    path = require('path'),
    fs = require('fs'),
    generator = require('./lib/generator.js');

/**
 * Generates Markdown documentation based on JSDoc comments.
 *
 * @name docup
 * @param options The options to use to generate documentation.
 * @returns {string} The generated Markdown code.
 */
function docup(options) {
  options = _.defaults(options || {}, {
    'hash': 'default',
    'lang': 'js',
    'title': path.basename(options.path) + ' documentation',
    'toc': 'category'
  });

  if (!options.path) {
    throw new Error('JS file path must be specified');
  }
  return generator(fs.readFileSync(options.path, 'utf8'), options);
}

module.exports = docup;
