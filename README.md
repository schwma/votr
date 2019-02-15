# Votr

Votr is a lightweight web app that allows users to create polls consisting of a question and one or more answers that can be voted for.

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

Creating the question gave us our admin token, which allows us to add answers to our question and delete the entire poll. It also gave us the question ID of our question.

We will now create two answers, "Red Team" and "Blue Team", with our admin token and the question ID.

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