'use strict';
const { TEXT ,STRING} = require('sequelize');
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
    toJSON()
    {
      return {...this.get(),id:undefined,password:undefined}
    }
  };
  User.init({
    uuid: {
      type:STRING,
      allowNull:false,
      defaultValue:DataTypes.UUIDV4
    },
    username: {
      type:STRING,
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
    },
    secret:{
      type:TEXT,
      allowNull:false,
      unique:false
    },
    pid:{
      type:TEXT,
      allowNull:false,
      unique:true
    },
    password:{
      type:STRING,
      allowNull:false,

    }
  }, {
    sequelize,
    modelName: 'users',
  });
  return User;
};