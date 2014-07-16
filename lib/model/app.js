
module.exports = function(database, DataTypes) {
  var App = Database.define("App", {
    name: DataTypes.STRING(255),
    username: DataTypes.STRING(255),
    icon_url: DataTypes.STRING(255)
  }, {
    timestamps: true,
    classMethods: {
      associate: function(model) {
        this.hasMany(model.action);
        this.hasMany(model.filter);
      }
    },
  });

  return App;
};
