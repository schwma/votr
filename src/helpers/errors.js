'use strict';

exports.INVALID_VALUE_ENABLED = {error: "Value of argument 'enabled' must be a boolean"};
exports.MISSING_ARGUMENT_TEXT = {error: 'Missing argument: text'};
exports.MISSING_ARGUMENT_TOKEN = {error: 'Missing argument: token'};
exports.DOES_NOT_EXIST_QUESTION = {error: 'The question with the requested ID does not exist'};
exports.DOES_NOT_EXIST_ANSWER = {error: 'The answer with the requested ID does not exist'};
exports.UNAUTHORIZED_QUESTION_UPDATE = {error: 'Token is not authorized to update this question'};
exports.UNAUTHORIZED_QUESTION_DELETE = {error: 'Token is not authorized to delete this question'};
exports.UNAUTHORIZED_ANSWER_CREATE = {
  error: 'Token is not authorized to create an answer for this question',
};
exports.NOT_ENABLED_VOTING = {error: 'Voting is not enabled for this question'};
