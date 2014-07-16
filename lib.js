/* jshint -W103 */
var EventEmitter = require("events").EventEmitter;
var FS = require("fs");
var Path = require("path");
var Util = require("util");

var Sequelize = require("sequelize");
var SlackClient = require("./lib/slack/client");
var SlackMessage = require("./lib/slack/message");
var SlackTransport = require("./lib/slack/transport");
var SQSClient = require("aws-sdk").SQS;

global.Process = global.process;

/**
 * Load module patches
 */
require("./lib/patch/winston");

/**
 * Configuration
 */
var Config = global.Config = require("./config");

/**
 * Service Connections
 */
var Database = global.Database = new Sequelize(Config.database.database,
  Config.database.user, Config.database.password, Config.database);

var Slack = global.Slack = new SlackClient(Config.slack.token);
var SQS = global.SQS = new SQSClient(Config.queue);

/**
 * Logging
 */
var Log = global.Log = require("winston");
Log.remove(Log.transports.Console);
Log.add(SlackTransport, Util._extend(Config.logger, Config.slack));
Log.add(Log.transports.File, Config.logger);

/**
 * Build the Core Model
 */
var Model = exports.Model = {};
FS.readdirSync(Path.join(__dirname, "lib/model")).forEach(function(name) {
  var entity = Database.import(Path.join(__dirname, "lib/model", name));

  Log.debug("Imported model entity " + entity.name);
  Model[Path.basename(name, ".js")] = entity;
});

Object.keys(Model).forEach(function(name) {
  Model[name].associate(Model);
});

Database.sync().done(function(err) {
  if(err) return library.emit("database.error", err);
  library.emit("database.ready");
});

/**
 * Create-or-Get the SQS queue for messages
 */
SQS.createQueue({
  QueueName: Config.queue.name,
  Attributes: {
    ReceiveMessageWaitTimeSeconds: "20"
  }
}, function(err, data) {
  if (err) return Log.error(err);

  Config.queue.url = data.QueueUrl;
  library.emit("queue.ready", data.QueueUrl);
});

/**
 * Module sanity
 */
var library = global.library = function(module) {
  return require(Path.join(__dirname, "lib", module));
};

library.control = function(module) {
  return require(Path.join(__dirname, "lib/control", module));
};

library.model = function(name) {
  if (Model[name]) return Model[name];
  throw ReferenceError("FATAL: Model " + name + " does not have an associated entity");
};

library.slack = function(module) {
  return require(Path.join(__dirname, "lib/slack", module));
};

library.ui = function(module) {
  return require(Path.join(__dirname, "lib/ui", module));
};

library.util = function(module) {
  return require(Path.join(__dirname, "lib/util", module));
};

/**
 * Attach an EventEmitter to `library`
 */
EventEmitter.call(library);
library.__proto__ = EventEmitter.prototype;
