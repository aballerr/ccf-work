"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class hrefTable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  hrefTable.init(
    {
      href: DataTypes.STRING,
      address: DataTypes.STRING,
      phone: DataTypes.STRING,
      companyName: DataTypes.STRING,
      searchTerm: DataTypes.STRING,
      phone_lookup: DataTypes.BOOLEAN,
      address_lookup: DataTypes.BOOLEAN,
      street: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "hrefTable",
    }
  );
  return hrefTable;
};
