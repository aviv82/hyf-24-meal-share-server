const knex = require("knex");
const config = require("../knexfile");

const db = knex(config.development);

const getAll = (route) => {
  return db(route);
};

const getById = (route, id) => {
  return db(route).where({ Id: Number(id) });
};

const create = (route, data) => {
  return db(route)
    .insert(data)
    .then((ids) => getById(route, ids[0]));
};

const update = (route, id, data) => {
  return db(route)
    .where({ Id: Number(id) })
    .update(data)
    .then(() => getById(route, id));
};

const remove = (route, id) => {
  return db(route).where({ Id: id }).del();
};

module.exports = { getAll, getById, create, update, remove };
