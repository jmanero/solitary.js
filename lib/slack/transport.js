var Util = require("util");
var Winston = require("winston");

var Transport = module.exports = function(options) {
  options = options || {};
  Winston.Transport.call(this, options);

  this.channel = options.channel;
  this.username = options.username || "Winston";
  this.icon_url = options.icon_url || "http://i.imgur.com/bHiFyoA.png";
  this.name = options.name || "slack";
};
Util.inherits(Transport, Winston.Transport);
Winston.transports.Slack = Transport;


Transport.prototype.log = function(level, message, meta, callback) {
  meta = Util._extend({}, meta);

  var color;
  switch(level) {
    case "error":
      color = "danger"; break;
    case "warn":
      color = "warning"; break;
    case "info":
      color = "good"; break;
  }

  // Include Level and Date in Meta
  meta.Level = level[0].toUpperCase() + level.slice(1);
  meta.Date = (new Date()).toISOString();

  // Convert metadata into attachment fields
  var fields = Object.keys(meta).map(function(title) {
    return ({
      title: title,
      value: meta[title],
      short: meta[title].length && meta[title].length < 42
    });
  });

  Slack.chat(this.channel, message, {
    attachments: [{
      fallback: message,
      color: color,
      fields: fields
    }],
    username: this.username,
    icon_url: this.icon_url
  }, callback);
};
