var Path = require("path");
var Request = require("request");
var URL = require("url");
var Util = require("util");

var Client = module.exports = function(token, options) {
  options = options || {};
  this.token = token;
  this.__uri = {
    protocol: "https",
    hostname: options.hostname || "slack.com",
    pathname: options.pathname || "/api"
  };
};

Client.prototype.uri = function(method, query) {
  var u = Util._extend({}, this.__uri);
  u.pathname = Path.join(u.pathname, method);

  u.query = query || {};
  u.query.token = this.token;

  return URL.format(u);
};

Client.prototype.api = function(method, request, callback) {
  Request.get({
    url: this.uri(method, request),
  }, function(err, res) {
    if (callback instanceof Function) callback(err, res.statusCode < 299);
  });
};

Client.prototype.chat = function(channel, message, options, callback) {
  var payload = {
    channel: channel,
    text: message,
    username: options.username || Config.slack.username,
    icon_url: options.icon_url || Config.slack.icon_url
  };

  if (options.attachments instanceof Array)
    payload.attachments = JSON.stringify(options.attachments);

  Slack.api("chat.postMessage", payload, callback);
};
