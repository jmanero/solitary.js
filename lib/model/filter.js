
module.exports = function(database, DataTypes) {
  var Filter = Database.define("Filter", {
    expression: DataTypes.STRING(255)
  }, {
    timestamps: true,
    classMethods: {
      associate: function(model) {
        this.belongsTo(model.app);
        this.belongsTo(model.action);
      }
    },
  });

  return Filter;
};
