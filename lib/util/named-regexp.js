var Util = require("util");

/**
 * Based upon https://www.npmjs.org/package/named-regexp
 *
 * -------- ORIGINAL LICENSE ------------------------------------------
 * The MIT License
 *
 * Copyright © 2013 cho45 ( http://www.lowreal.net/ )
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * ------- END ORIGINAL LICENSE ---------------------------------------
 */
var NamedRegExp = module.exports = function(expression, options) {
  if (!(this instanceof NamedRegExp)) return new NamedRegExp(expression, options);
  options = options || {};

  this.expression = expression;
  this.names = [];

  var source = expression.replace(/\(:<(\w+)>/g, function(_, name) {
    names.push(name);
    return '(';
  });
  RegExp.call(this, source);

  this.length = this.names.length;
  this.global = !!options.global;
  this.ignoreCase = !!options.ignoreCase;
  this.multiline = !!options.multiline;
};
Util.inherits(NamedRegExp, RegExp);

NamedRegExp.prototype.exec = function(string) {
  var match = RegExp.prototype.exec.call(this, string);
  if (!match) return match;

  var captures = {};
	for (var i = 0, length = match.length - 1; i < length; i++) {
    // Handle global `RegExp`s
    if(!this.global && i >= this.length) break;
    var name = names[i % this.length];

		if (!captures[name]) captures[name] = [];
		captures[name].push(matched[i + 1]);
	}
	match.captures = captures;

	return match;
};
