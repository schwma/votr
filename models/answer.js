'use strict';

module.exports = (sequelize, DataTypes) => {
  let Answer = sequelize.define('answer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  Answer.associate = function(models) {
    Answer.question = Answer.belongsTo(models.question, {
      as: 'question',
      foreignKey: 'questionId',
    });
    Answer.votes = Answer.hasMany(models.vote, {
      as: 'votes',
      foreignKey: 'answerId',
      onDelete: 'cascade'
    });
  };

  return Answer;
};
