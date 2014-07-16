var Logger = require("winston").Logger;

function noop() {}

/**
 * Fix Winston's tragic handling of errors
 */
var __log = Logger.prototype.log;
Logger.prototype.log = function(level, message, meta, callback) {
  if (!(message instanceof Error)) // Not an error. Carry on.
    return __log.apply(this, Array.apply(null, arguments));

  meta = meta || {};
  if (meta instanceof Function) {
    callback = meta;
    meta = {};
  }

  // Try to scrape enumerable attributes out of the Error object
  Object.keys(message).forEach(function(key) {
    meta[key] = message[key] + "";
  });

  // Pull non-enumerable attributes from the Error
  if (message.stack) meta["Stack Trace"] = message.stack;
  meta["Error Type"] = message.name;
  message = message.message;

  __log.call(this, level, message, meta, callback || noop);
};
