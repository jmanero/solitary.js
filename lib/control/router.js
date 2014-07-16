var Action = library.model("app");
var App = library.model("app");
var NamedRegExp = library.util("named-regexp");

/**
 * Handle pattern matching on incoming messages and task
 *  routing to workers
 */
var Control = module.exports = function(queue, workers) {
  this.routes = {};
};

Control.create = function(queue, workers) {
  return new Control(queue, workers);
};

Control.prototype.route = function(message) {
  // Ignore bots (breaks feedback loops)
  if (message.user === "USLACKBOT") return message.delete();
  Log.silly("Message from " + message.username + ": " + message.text);

  var router = this;
  Object.keys(this.routes).forEach(function(id) {
    var route = router.routes[id];
    var text = message.text;

    if (route.filter.test(text)) {
      Action.find({
        where: {
          id: route.action
        },
        include: [App]
      }).done(function(err, action) {
        if (err) return Log.error(err);

        // Pass message, capture, and action to work-cluster
        router.workers.task(message, text.match(route.filter), action);
      });
    }
  });

  // Remove from queue
  message.delete();
};

Control.prototype.addRoute = function(id, filter, action) {
  this.routes[id] = {
    filter: new NamedRegExp(filter),
    action: action
  };

  return id;
};

Control.prototype.removeRoute = function(id) {
  return (delete this.routes[id]);
};
