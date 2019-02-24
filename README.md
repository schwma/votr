# Votr

Votr is a lightweight web app that allows users to create polls consisting of a question and one or more answers that can be voted for.

**NOTE: Votr is currently in development and does not yet have a user interface. Votr also currently does not feature any form of vote protection and thus does not prevent the same user from submitting multiple votes.**

## Running Votr

```bash
# Install dependencies
npm install

# Start Votr
npm start
```

## REST API

### Overview

|CRUD|Route|HTTP Verb|POST Body|Result Example
|---|---|---|---|---|
||**Question**||||
|Create|/api/question|POST|"text=Which team do you think will win?&enabled=false"|\{"id":"i0o3g53q","text":"Which team do you think will win?","enabled":false,"token":"w5z966gxgh43nsrh9ofchjodgi8aj6lp"}|
|Read|/api/question/:question_id|GET|_empty_|\{"id":"i0o3g53q","text":"Which team do you think will win?","creationDate":"2019-02-11T22:15:14.000Z","enabled":true,"answers":[\{"id":"mjw9imk3","text":"Red Team","votes":1},{"id":"t9i2gbw7","text":"Blue Team","votes":2}]}|
|Update|/api/question/:question_id|PUT|"enabled=true"|ok|
|Delete|/api/question/:question_id|DELETE|"token=_token_"|Question with id \{i0o3g53q} was deleted!|
||**Answer**||||
|Create|/api/answer/:question_id|POST|text="Red Team&token=_token_"|\{"id":"mjw9imk3","text":"Red Team"}|
||**Vote**||||
|Create|/api/vote/:question_id/:answer_id|POST|_empty_|ok|

### Example

First we'll create our question: "Which team do you think will win?".

```bash
$ curl --request POST --data "text=Which team do you think will win?&enabled=false" localhost:8080/api/question
{"id":"i0o3g53q","text":"Which team do you think will win?","enabled":false,"token":"w5z966gxgh43nsrh9ofchjodgi8aj6lp"}
```

Creating the question gave us our question token, which allows us to add answers to our question and delete the entire poll. It also gave us the question ID of our question.

We will now create two answers, "Red Team" and "Blue Team", with our question token and the question ID.

```bash
$ curl --request POST --data "text=Red Team&token=w5z966gxgh43nsrh9ofchjodgi8aj6lp" localhost:8080/api/answer/i0o3g53q
{"id":"mjw9imk3","text":"Red Team"}

$ curl --request POST --data "text=Blue Team&token=w5z966gxgh43nsrh9ofchjodgi8aj6lp" localhost:8080/api/answer/i0o3g53q
{"id":"t9i2gbw7","text":"Blue Team"}
```

Now lets enable our question to allow voting.

```bash
$ curl --request PUT --data "enabled=true" localhost:8080/api/question/i0o3g53q
ok
```

To vote on an answer we need the question ID and the answer ID that we want to vote on.

Let's vote once on the answer "Red Team" and twice on the answer "Blue Team".

```bash
$ curl --request POST localhost:8080/api/vote/i0o3g53q/mjw9imk3
ok

$ curl --request POST localhost:8080/api/vote/i0o3g53q/t9i2gbw7
ok

$ curl --request POST localhost:8080/api/vote/i0o3g53q/t9i2gbw7
ok
```

Now let's check the current state of our poll.

```bash
$ curl --request GET localhost:8080/api/question/i0o3g53q
{"id":"i0o3g53q","text":"Which team do you think will win?","creationDate":"2019-02-11T22:15:14.000Z","enabled":true,"answers":[{"id":"mjw9imk3","text":"Red Team","votes":1},{"id":"t9i2gbw7","text":"Blue Team","votes":2}]}
```

To delete our poll we'll need our question ID and our admin token.

```bash
$ curl --request DELETE --data "token=w5z966gxgh43nsrh9ofchjodgi8aj6lp" localhost:8080/api/question/i0o3g53q
Question with id {i0o3g53q} was deleted!
```
## Glossary

- **Poll**: A combination of a *Question*, *Answers*, and *Votes*
- **Question**: The question that a user wants to ask. Acts as the description text of a poll. An example for a question would be: "Which team do you think will win?" Several attributes are associated with a question that determine how the poll behaves. A question can also have answers associated with it.
- **Answer**: A single entry, belonging to a question, that users can vote for. Continuing our example, an answer could be: "Blue Team". An answer can have zero or more votes.
- **Vote**: A single vote for a single answer.
- **Vote Protection**: Methods that prevent users from voting on the same poll twice.
- **Question Token**: A secret token that allows the user to edit a poll. Example actions which require a question token are: adding an answer to a question, deleting a question. Voting does not require the question token.

## License

Votr is licensed under [MIT license](LICENSE).