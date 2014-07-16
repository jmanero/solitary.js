
console.log("Hello World!");
var interval = setInterval(function() {
  console.log("Worker " + process.env["id"] + " is alive!");
}, 10000);

process.on("SIGINT", function() {
  console.log("Worker " + process.env["id"] + " recieved SIGINT");
  clearInterval(interval);
});

// process.on("SIGTERM", function() {
//   // The parent process seems to get impatient and send SIGTERM if we don't
//   //   terminate fairly quickly after receiving SIGINT...
// });
