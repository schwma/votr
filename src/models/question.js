'use strict';

const config = require(__dirname + '/../../config/votr.json');

module.exports = (sequelize, DataTypes) => {
  let Question = sequelize.define('question', {
    id: {
      type: DataTypes.STRING(config.questionIdLength),
      primaryKey: true,
      allowNull: false,
      validate: {
        is: '^[' + config.questionIdAlphabetRegex + ']{' + config.questionIdLength + '}$',
      },
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(config.questionTokenLength),
      allowNull: false,
      validate: {
        is: '^[' + config.questionTokenAlphabetRegex + ']{' + config.questionTokenLength + '}$',
      },
    },
  });

  Question.associate = function(models) {
    Question.answers = Question.hasMany(models.answer, {
      as: 'answers',
      foreignKey: 'questionId',
      onDelete: 'cascade',
      hooks: true,
    });
  };

  return Question;
};
