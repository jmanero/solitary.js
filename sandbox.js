
var Sandbox = module.exports = function(team, app) {
  Object.defineProperties(this, {
    team: {
      value: team,
      writable: false,
      configurable: false
    },
    app: {
      value: app,
      writable: false,
      configurable: false
    }
  });

};

Sandbox.prototype.require = function() {

};
