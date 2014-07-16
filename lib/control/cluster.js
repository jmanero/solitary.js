var CP = require("child_process");
var LibUUID = require("libuuid");
var EventEmitter = require("events").EventEmitter;
var Util = require("util");

var Control = module.exports = function(script) {
  EventEmitter.call(this);

  this.__shutdown = false;
  this.script = script;
  this.count = Config.cluster.workers || 8;
  this.workers = {};

  // Start the worker processes
  while (Object.keys(this.workers).length < this.count) this.spawn();
};
Util.inherits(Control, EventEmitter);

Control.create = function(script) {
  return new Control(script);
};

/**
 * Create a new worker process
 */
Control.prototype.spawn = function() {
  var cluster = this;
  var id = LibUUID.create();
  Log.debug("Spawning worker " + id);

  var worker = CP.fork(this.script, {
    env: {
      id: id
    },
    detached: true
  });
  this.workers[id] = worker;
  worker.id = id;

  worker.on("error", function(err) {
    Log.error(err);
  });

  worker.on("exit", function(code, sig) {
    delete cluster.workers[id];
    if (cluster.__shutdown) return Log.debug("Worker " + id + " shutdown with code " + code);

    Log.warn("Worker " + id + " exited with code " + code);
    cluster.spawn();
  });

  worker.on("message", function(event) {
    // TODO Event router for worker messages
  });

  // TODO Retrieve stack traces from worker crashes
};

Control.prototype.task = function(task, callback) {
  // TODO Synchronization of tasks
};

Control.prototype.force = function(callback) {
  var cluster = this;

  Object.keys(this.workers).forEach(function(id) {
    cluster.workers[id].kill("SIGKILL");
  });

  if (callback instanceof Function) callback();
};

Control.prototype.shutdown = function(callback) {
  var cluster = this;
  this.__shutdown = true;

  Log.debug("Asking workers to stop poiltely");
  Object.keys(this.workers).forEach(function(id) {

    // Callback when all workers have terminated
    cluster.workers[id].once("exit", function(code, sig) {
      clearTimeout(timeout); // Stop the SIGKILL timeout

      if (Object.keys(cluster.workers).length === 0) {
        Log.debug("All workers have terminated");
        callback();
      }
    });

    // Try the polite approach
    cluster.workers[id].kill("SIGINT");

    // Get more aggressive after a couple of seconds
    var timeout = setTimeout(function() {
      Log.warn("Sending SIGKILL to worker " + id);
      cluster.workers[id].kill("SIGKILL");
    }, 10000);
  });
};
