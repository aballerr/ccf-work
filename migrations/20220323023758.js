"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("hrefTables", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      href: {
        type: Sequelize.TEXT,
      },
      address: {
        type: Sequelize.TEXT,
      },
      phone: {
        type: Sequelize.TEXT,
      },
      companyName: {
        type: Sequelize.TEXT,
      },
      searchTerm: {
        type: Sequelize.TEXT,
      },
      phone_lookup: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      address_lookup: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      street: {
        type: Sequelize.TEXT,
      },
      city: {
        type: Sequelize.TEXT,
      },
      state: {
        type: Sequelize.TEXT,
      },
      zip: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("hrefTables");
  },
};
