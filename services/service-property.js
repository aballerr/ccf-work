const serviceDb = require("./service-db");
const service = {};

service.Property = serviceDb.Property;

service.getAllProperties = () =>
  serviceDb.Property.findAll({
    raw: true,
    where: {
      owner_name: null,
    },
  });

service.addProperty = (property) =>
  serviceDb.Property.findOrCreate({
    where: {
      geo_location: property.geo_location,
    },
    defaults: property,
  });

service.getAndUpdate = (property) =>
  serviceDb.Property.update(property, {
    where: {
      geo_location: property.geo_location,
    },
  });

service.addDeadPerson = (deadPerson) =>
  serviceDb.DeadPerson.findOrCreate({
    where: {
      fullName: deadPerson.fullName,
      website: deadPerson.website,
    },
    defaults: deadPerson,
  });

service.addHref = (href, searchTerm) =>
  serviceDb.HREF.findOrCreate({
    where: {
      href,
    },
    defaults: {
      href,
      searchTerm,
      phone: "[]",
    },
  });

service.updateHref = (href) => {
  serviceDb.HREF.update(href, {
    where: {
      id: href.id,
    },
  });
};

service.getAll = (condition = {}) =>
  serviceDb.HREF.findAll({ where: { ...condition } });

module.exports = service;
