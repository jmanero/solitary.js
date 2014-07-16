var Path = require("path");

exports.redis = {
  host: "localhost",
  port: 6379
};

exports.sql = {
  logging: false,
  database: "development",
  user: "development",
  password: "nothing",
  dialect: "sqlite",
  storage: Path.join(__dirname, "database.sqlite")
};

exports.sqs = {
  region: "us-east-1",
  accessKeyId: "",
  secretAccessKey: "",
  sslEnabled: true,
  apiVersion: "latest",
  channel: ""
};

exports.cluster = {
  workers: 4
};
