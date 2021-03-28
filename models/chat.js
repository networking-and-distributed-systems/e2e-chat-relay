'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({users}) {
      this.belongsTo(users,{foreignKey:'fromid', as:'FromUser'})
      this.belongsTo(users,{foreignKey:'toid', as:'ToUser'})
    }
  };
  Chat.init({
    fromid: DataTypes.INTEGER,
    toid: DataTypes.INTEGER,
    message: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};