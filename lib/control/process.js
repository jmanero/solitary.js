var CP = require("child_process");

var Control = module.exports = function(options) {
  options = options || {};

  this.shutdownTasks = options.shutdown || [];
  this.forceShutdownTasks = options.force || [];
};

Control.create = function(options) {
  var control = new Control(options);

  // Handle signals
  process.once("SIGINT", control.onShutdownSignal.bind(control, "SIGINT"));
  process.once("SIGTERM", control.onShutdownSignal.bind(control, "SIGTERM"));

  process.once("SIGHUP", function() {
    Log.info("Recieved SIGHUP");
    control.restart();
  });
};

Control.prototype.onShutdownSignal = function(signal) {
  Log.info("Recieved " + signal);

  // Add force-quit hooks
  Process.once("SIGINT", this.force.bind(this));
  Process.once("SIGTERM", this.force.bind(this));
  Log.info("Send " + signal + " again to force-terminate the service");

  this.shutdown(true);
};

function aloop(tasks, action, callback) {
  if (!tasks.length) return callback();

  tasks.shift()[action](function(err) {
    if (err) return callback(err);
    aloop(tasks, action, callback);
  });
}

Control.prototype.shutdown = function(terminate, callback) {
  var control = this;

  Log.info("Atempting graceful shutdown of service");
  if (terminate instanceof Function) {
    callback = terminate;
    terminate = false;
  }

  aloop(this.shutdownTasks.concat([]), "shutdown", function(err) {
    if (err) return callback(err);

    if (terminate) { // Give the log time to flush
      Log.info("Shutting down service in 5 seconds. Goodbye.");
      setTimeout(Process.exit, 5000);
    }

    if (callback instanceof Function) callback();
  });
};

Control.prototype.restart = function() {
  this.shutdown(function(err) {
    Log.info("Starting new instance of service");

    // Start a new instance of this process and `unref` it
    var newService = CP.fork(__executable, {
      detached: true
    });
    newService.unref();

    Log.debug("Spawned new service with PID " + newService.pid +
      ". Shutting down in 5s");
    setTimeout(Process.exit, 5000);
  });
};

Control.prototype.force = function() {
  Log.warn("Forcefully terminating service");
  aloop(this.forceShutdownTasks.concat([]), "force", function(err) {
    Process.exit();
  });
};
