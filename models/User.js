'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    uuid: {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:DataTypes.UUIDV4
    },
    username: {
      type:DataTypes.STRING,
      allowNull:false,
      unique:true,
      validate:{
        notEmpty:{msg:"Username must not be empty"},
        notNull:{msg:"Every user must have a username"},
        is:{
          args:/^[a-zA-Z0-9_]*$/,
          msg:"username must only contain  Alphanumerics and underscores"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'users',
  });
  return User;
};