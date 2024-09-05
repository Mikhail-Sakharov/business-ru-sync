import {Sequelize} from 'sequelize';

const host = process.env.DB_HOST;
const port = Number(process.env.DB_PORT);
const database = process.env.DB_NAME;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

export const sequelize = new Sequelize(database!, user!, password, {
  host,
  port,
  dialect: 'mysql'
});
