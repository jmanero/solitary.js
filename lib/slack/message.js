/**
 * Slack message received via SQS
 */
var Message = module.exports = function(message) {
  // SQS Parameters
  this.id = message.MessageId;
  this.receipt = message.ReceiptHandle;

  // Slack Message
  var body = JSON.parse(message.Body);
  this.token = body.token;
  this.team = body.team_id;
  this.channel = body.channel_id;
  this.timestamp = body.timestamp;
  this.user = body.user_id;
  this.username = body.user_name;
  this.text = body.text;
};

/**
 * Delete the message from the SQS queue
 */
Message.prototype.delete = function(callback) {
  SQS.deleteMessage({
    QueueUrl: Config.queue.url,
    ReceiptHandle: this.receipt
  }, function(err) {
    if (err) Log.error(err);
    if (callback instanceof Function) callback(err);
  });
};

/**
 * Respond to a message via the Slack API
 */
Message.prototype.respond = function(message, options, callback) {
  Slack.chat(this.channel, message, options, function(err) {
    if (err) Log.error(err);
    if (callback instanceof Function) callback(err);
  });
};
