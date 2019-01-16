'use strict';

module.exports = (sequelize, DataTypes) => {
  let Vote = sequelize.define('vote', {
  	id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    creationDate: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    }
  });

  Vote.associate = function(models) {
    Vote.answer = Vote.belongsTo(models.answer, {
      as: 'answer',
      foreignKey: 'answerId'
    });
  };

  return Vote;
};
