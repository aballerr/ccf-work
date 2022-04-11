const { development, production } = require("../config/config");
const Sequelize = require("sequelize");
const service = {};

service.init = async () => {
  const { NODE_ENV } = process.env;

  console.log(`NODE_ENV: ${NODE_ENV}`);

  let { username, password, database, host, dialect, logging } =
    NODE_ENV === "production" ? production : development;

  const sequelize = await new Sequelize(database, username, password, {
    host: host,
    dialect: dialect,
    logging: logging,
  });

  try {
    console.log("connecting...");
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (err) {
    console.log(host);
    console.error("Unable to connect to the database:", err);
    process.exit();
  }

  service.HREF = require("../models/hreftable")(sequelize, Sequelize);

  return Promise.resolve();
};

module.exports = service;
