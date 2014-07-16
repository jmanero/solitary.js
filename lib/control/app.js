var Action = library.model("app");
var App = library.model("app");
var Filter = library.model("app");

/**
 * App Control Logic
 */
var Control = module.exports = function(router) {
  this.router = router;

  // Load current filters from the database
  Filter.findAll().done(function(err, filters) {
    if(err) return Log.error(err);

    filters.forEach(function(filter) {
      router.addRoute(filter.id, filter.expression, filter.action_id);
    });
  });
};

Control.create = function(router) {
  return new Control(router);
};

Control.prototype.addAction = function(app, code, callback) {

};

Control.prototype.addFilter = function(app, action, expression, callback) {
  Filter.create({
    app_id: app.id,
    action_id: action.id,
    expression: expression
  }).done(function(err, filter) {
    if(err) return callback(err);

    router.addRoute(filter.id, expression, action.id);
    callback(null, filter);
  });
};
