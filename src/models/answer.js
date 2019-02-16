'use strict';

module.exports = (sequelize, DataTypes) => {
  let Answer = sequelize.define('answer', {
    id: {
      type: DataTypes.STRING('8'),
      primaryKey: true,
      allowNull: false,
      validate: {
        // Alphanumeric string, lowercase, 8 characters long
        is: '^[a-z0-9]{8}$',
      },
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Answer.associate = function(models) {
    Answer.question = Answer.belongsTo(models.question, {
      as: 'question',
      foreignKey: 'questionId',
    });
    Answer.votes = Answer.hasMany(models.vote, {
      as: 'votes',
      foreignKey: 'answerId',
      onDelete: 'cascade',
      hooks: true,
    });
  };

  return Answer;
};
