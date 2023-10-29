import { Sequelize } from "sequelize";
import 'dotenv/config'

const sequelize = new Sequelize({
    dialect : process.env.DIALECT,
    logging: false,
    host: process.env.HOST,
    database: process.env.DATABASE,
    username: process.env.USERNAME2,
    password: process.env.PASSWORD
})

export {sequelize}