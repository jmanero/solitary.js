var EventEmitter = require("events").EventEmitter;
var Util = require("util");

/**
 * Manage SQS feeds
 */
var Control = module.exports = function() {
  EventEmitter.call(this);
  var control = this;
  this.__shutdown = false;

  // Start the poller when the SQS queue is ready
  library.on("queue.ready", function(url) {
    Log.debug("Using queue at " + url);
    poller.call(control, url);
  });
};
Util.inherits(Control, EventEmitter);

Control.create = function() {
  return new Control();
};

// Long-poll loop for incoming messages
function poller(url) {
  var control = this;

  // Call shutdown callback after final long-poll has returned
  if (this.__shutdown instanceof Function) return this.__shutdown();

  SQS.receiveMessage({
    QueueUrl: url,
    WaitTimeSeconds: "20",
    MaxNumberOfMessages: "10"
  }, function(err, data) {
    if (err) Log.error(err);
    else if (data.Messages instanceof Array) data.Messages.forEach(function(message) {
      control.emit("message", new SlackMessage(message));
    });

    poller.call(control, url);
  });
}

Control.prototype.shutdown = function(callback) {
  Log.debug("Stopping queue poller");
  this.__shutdown = function() {
    Log.debug("Queue polling stopped");
    if(callback instanceof Function) callback();
  };
};
