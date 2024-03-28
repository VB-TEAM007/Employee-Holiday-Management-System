import { DataTypes, STRING } from "sequelize";
import { client } from "../utils/db.config.js";

export const employee = client.define('employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  remainingHolidays: {
    type: DataTypes.INTEGER
  },
  hash:{
    type: DataTypes.STRING,
    allowNull: false 
  },
  salt:{
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.ENUM('employee', 'admin')
  }
  }, {
    tableName: 'employees',
    createdAt: false,
    updatedAt: false,
    underscored: true
});
