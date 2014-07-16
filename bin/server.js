require("../lib");
global.__executable = __filename;

Log.info("Starting Solitary server with PID " + Process.pid, {
  PID: Process.pid
});

var Delight = require("express-delight");
var Express = require("express");
var HTTP = require("http");
var Path = require("path");

/**
 * HTTP Management Interface
 */
var ui = Express();
var server = HTTP.createServer(ui);
server.shutdown = function(callback) {
  Log.info("Stopping HTTP control server");
  this.close(callback);
};

// ui.use(Morgan());
ui.use(Delight.favicon(Path.resolve(__dirname, "../assets/favicon.gif")));
ui.use("/assets", Delight.static(Path.resolve(__dirname, "../assets")));

Delight.util(ui);
Delight.body(ui);
Delight.validate(ui);

/**
 * Create controllers
 */
var queue = library.control("queue").create();
var workers = library.control("cluster").create(Path.join(__dirname, "worker.js"));
var router = library.control("router").create(queue, workers);
var process = library.control("process").create({
  shutdown: [queue, workers, server],
  force: [workers]
});

library.once("database.ready", function() {
  var app = library.control("app").create(router);

  library.ui("app").attach(ui, app);
  // library.ui("auth").attach(ui);

  Delight.errors(ui, {
    console: true,
    views: true
  });

  server.listen(8080);
});
