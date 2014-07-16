
module.exports = function(database, DataTypes) {
  var Action = Database.define("Action", {
    code: DataTypes.TEXT
  }, {
    timestamps: true,
    classMethods: {
      associate: function(model) {
        this.belongsTo(model.app);
        this.hasMany(model.filter);
      }
    },
  });

  return Action;
};
