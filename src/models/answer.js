'use strict';

const config = require(__dirname + '/../../config/votr.json');

module.exports = (sequelize, DataTypes) => {
  let Answer = sequelize.define('answer', {
    id: {
      type: DataTypes.STRING(config.answerIdLength),
      primaryKey: true,
      allowNull: false,
      validate: {
        is: '^[' + config.answerIdAlphabetRegex + ']{' + config.answerIdLength + '}$',
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
