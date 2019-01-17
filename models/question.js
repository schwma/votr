'use strict';

module.exports = (sequelize, DataTypes) => {
  let Question = sequelize.define('question', {
    id: {
      type: DataTypes.STRING('8'),
      primaryKey: true,
      allowNull: false,
      validate: {
        // Alphanumeric string, lowercase, 8 characters long
        is: "^[a-z0-9]{8}$"
      }
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creationDate: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING('32'),
      allowNull: false,
      validate: {
        // Alphanumeric string, lowercase, 32 characters long
        is: "^[a-z0-9]{32}$"
      }
    }
  });

  Question.associate = function(models) {
    Question.answers = Question.hasMany(models.answer, {
      as: 'answers',
      foreignKey: 'questionId',
      onDelete: 'cascade'
    });
  };

  return Question;
};
