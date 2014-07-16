var App = library.model("app");

exports.attach = function(app, control) {
  app.get("/app", function(req, res, next) {
    App.findAll().done(function(err, apps) {
      if(err) return next(err);
      res.render("app-list.ejs", {
        keys: Object.keys(apps).sort(),
        apps: apps
      });
    });
  });

  app.get("/app/:id", function(req, res, next) {

  });

  app.post("/app", function(req, res, next) {

  });
};
