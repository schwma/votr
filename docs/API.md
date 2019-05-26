# Overview

| CRUD   | Route                              | HTTP Verb | POST Body                                                           | Result Example                                                                                                                                                                                                                   |
| ------ | ---------------------------------- | --------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|        | **Question**                       |           |                                                                     |                                                                                                                                                                                                                                  |
| Create | /api/questions                     | POST      | '{ "text": "Which team do you think will win?", "enabled": false }' | \{"id":"i0o3g53q", "token":"w5z966gxgh43nsrh9ofchjodgi8aj6lp"}                                                                                                                                                                   |
| Read   | /api/questions/:question_id        | GET       | _empty_                                                             | \{"id":"i0o3g53q","text":"Which team do you think will win?","creationDate":"2019-02-11T22:15:14.000Z","enabled":true,"answers":[\{"id":"mjw9imk3","text":"Red Team","votes":1},{"id":"t9i2gbw7","text":"Blue Team","votes":2}]} |
| Update | /api/questions/:question_id        | PUT       | '{ "enabled": true }'                                               | _empty_                                                                                                                                                                                                                          |
| Delete | /api/questions/:question_id        | DELETE    | '{ "token": _token_ }'                                              | _empty_                                                                                                                                                                                                                          |
|        | **Answer**                         |           |                                                                     |                                                                                                                                                                                                                                  |
| Create | /api/answers/:question_id          | POST      | '{ "text": "Red Team", "token":"_token_" }'                         | \{"id":"mjw9imk3"}                                                                                                                                                                                                               |
|        | **Vote**                           |           |                                                                     |                                                                                                                                                                                                                                  |
| Create | /api/votes/:question_id/:answer_id | POST      | _empty_                                                             | _empty_                                                                                                                                                                                                                          |

# Example

First we'll create our question: "Which team do you think will win?".

```bash
$ curl --request POST -header "Content-Type: application/json" --data '{ "text": "Which team do you think will win?", "enabled": false }' localhost:8080/api/questions
{"id":"i0o3g53q", "token":"w5z966gxgh43nsrh9ofchjodgi8aj6lp"}
```

Creating the question gave us our question token, which allows us to add answers to our question and delete the entire poll. It also gave us the question ID of our question.

We will now create two answers, "Red Team" and "Blue Team", with our question token and the question ID.

```bash
$ curl --request POST -header "Content-Type: application/json" --data '{ "text": "Red Team", "token": "w5z966gxgh43nsrh9ofchjodgi8aj6lp" }' localhost:8080/api/answers/i0o3g53q
{"id":"mjw9imk3","text":"Red Team"}

$ curl --request POST -header "Content-Type: application/json" --data '{ "text": "Blue Team", "token": "w5z966gxgh43nsrh9ofchjodgi8aj6lp" }' localhost:8080/api/answers/i0o3g53q
{"id":"t9i2gbw7","text":"Blue Team"}
```

Now lets enable our question to allow voting.

```bash
$ curl --request PUT -header "Content-Type: application/json" --data '{ "enabled": true, "token": "w5z966gxgh43nsrh9ofchjodgi8aj6lp" }' localhost:8080/api/questions/i0o3g53q
```

To vote on an answer we need the question ID and the answer ID that we want to vote on.

Let's vote once on the answer "Red Team" and twice on the answer "Blue Team".

```bash
$ curl --request POST localhost:8080/api/votes/i0o3g53q/mjw9imk3

$ curl --request POST localhost:8080/api/votes/i0o3g53q/t9i2gbw7

$ curl --request POST localhost:8080/api/votes/i0o3g53q/t9i2gbw7
```

Now let's check the current state of our poll.

```bash
$ curl --request GET localhost:8080/api/questions/i0o3g53q
{"id":"i0o3g53q","text":"Which team do you think will win?","creationDate":"2019-02-11T22:15:14.000Z","enabled":true,"answers":[{"id":"mjw9imk3","text":"Red Team","votes":1},{"id":"t9i2gbw7","text":"Blue Team","votes":2}]}
```

To delete our poll we'll need our question ID and our admin token.

```bash
$ curl --request DELETE -header "Content-Type: application/json" --data '{ "token": "w5z966gxgh43nsrh9ofchjodgi8aj6lp" }' localhost:8080/api/questions/i0o3g53q
```

# Details

## Question

### Create a Question

---

Creates a poll question.

-   **URL**

    /api/questions

-   **Method:**

    `POST`

-   **URL Params**

    None

-   **Data Params**

    **Required:**

    `text=[string]`

    **Optional:**

    `enabled=[boolean]`

-   **Success Response:**

    -   **Code:** 201 Created
        **Content:** `{ id: "i0o3g53q", token: "w5z966gxgh43nsrh9ofchjodgi8aj6lp" }`

-   **Error Response:**

    -   **Code:** 400 Bad Request
        **Content:** `{ error: "Missing argument: text" }`

    OR

    -   **Code:** 422 Unprocessable Entity
        **Content:** `{ error: "Value of argument 'enabled' must be a boolean" }`

-   **Sample Call:**

```bash
curl --request POST --data '{ "text": "Which team do you think will win?", "enabled": false }' localhost:8080/api/questions
```

-   **Notes:**

    None

### Get a Question's Details

---

Returns information about a question, as well as the answers and votes that are associated with it.

-   **URL**

    /api/questions/:question_id

-   **Method:**

    `GET`

-   **URL Params**

    **Required:**

    `question_id=[string]`

    **Optional:**

    None

-   **Data Params**

    None

-   **Success Response:**

    -   **Code:** 200 OK
        **Content:** `{ id: "i0o3g53q", text: "Which team do you think will win?", creationDate: "2019-02-11T22:15:14.000Z", enabled: true, answers: [ { id: "mjw9imk3", text: "Red Team", votes: 1 }, { id: "t9i2gbw7", text: "Blue Team", votes: 2 } ] }`

-   **Error Response:**

    -   **Code:** 404 Not Found
        **Content:** `{ error: "The question with the requested ID does not exist" }`

-   **Sample Call:**

```bash
curl --request GET localhost:8080/api/questions/i0o3g53q
```

-   **Notes:**

    None

### Update a Question's Details

---

Updates a question's details. Allows questions to be enabled or disabled.

-   **URL**

    /api/questions/:question_id

-   **Method:**

    `PUT`

-   **URL Params**

    **Required:**

    `question_id=[string]`

    **Optional:**

    None

-   **Data Params**

    **Required:**

    `token=[string]`

    **Optional:**

    `enabled=[boolean]`

-   **Success Response:**

    -   **Code:** 204 No Content
        **Content:** None

-   **Error Response:**

    -   **Code:** 400 Bad Request
        **Content:** `{ error: "Missing argument: token" }`

    OR

    -   **Code:** 422 Unprocessable Entity
        **Content:** `{ error: "Value of argument 'enabled' must be a boolean" }`

    OR

    -   **Code:** 401 Unauthorized
        **Content:** `{ error: "Token is not authorized to update this question" }`

    OR

    -   **Code:** 404 Not Found
        **Content:** `{ error: "The question with the requested ID does not exist" }`

-   **Sample Call:**

```bash
curl --request PUT -header "Content-Type: application/json" --data '{ "enabled": true, "token": "w5z966gxgh43nsrh9ofchjodgi8aj6lp" }' localhost:8080/api/questions/i0o3g53q
```

-   **Notes:**

    None

### Delete a Question

---

Deletes a question and all the answers and votes that are associated with it.

-   **URL**

    /api/questions/:question_id

-   **Method:**

    `DELETE`

-   **URL Params**

    **Required:**

    `question_id=[string]`

    **Optional:**

    None

-   **Data Params**

    **Required:**

    `token=[string]`

    **Optional:**

    None

-   **Success Response:**

    -   **Code:** 204 No Content
        **Content:** None

-   **Error Response:**

    -   **Code:** 400 Bad Request
        **Content:** `{ error: "Missing argument: token" }`

    OR

    -   **Code:** 401 Unauthorized
        **Content:** `{ error: "Token is not authorized to delete this question" }`

    OR

    -   **Code:** 404 Not Found
        **Content:** `{ error: "The question with the requested ID does not exist" }`

-   **Sample Call:**

```bash
curl --request DELETE -header "Content-Type: application/json" --data '{ "token": "w5z966gxgh43nsrh9ofchjodgi8aj6lp" }' localhost:8080/api/questions/i0o3g53q
```

-   **Notes:**

    None

## Answer

### Create an Answer

---

Creates an answer for a poll question.

-   **URL**

    /api/answers/:question_id

-   **Method:**

    `POST`

-   **URL Params**

    **Required:**

    `question_id=[string]`

    **Optional:**

    None

-   **Data Params**

    **Required:**

    `token=[string]`

    `text=[string]`

    **Optional:**

    None

-   **Success Response:**

    -   **Code:** 201 Created
        **Content:** `{ "id": "mjw9imk3" }`

-   **Error Response:**

    -   **Code:** 400 Bad Request
        **Content:** `{ error: "Missing argument: text" }`

    OR

    -   **Code:** 400 Bad Request
        **Content:** `{ error: "Missing argument: token" }`

    OR

    -   **Code:** 401 Unauthorized
        **Content:** `{ error: "Token is not authorized to create an answer for this question" }`

    OR

    -   **Code:** 404 Not Found
        **Content:** `{ error: "The question with the requested ID does not exist" }`

-   **Sample Call:**

```bash
curl --request POST -header "Content-Type: application/json" --data '{ "text": "Blue Team", "token": "w5z966gxgh43nsrh9ofchjodgi8aj6lp" }' localhost:8080/api/answers/i0o3g53q
```

-   **Notes:**

    None

## Vote

### Create a Vote

---

Create a vote for a poll's answer.

-   **URL**

    /api/votes/:question_id/:answer_id

-   **Method:**

    `POST`

-   **URL Params**

    **Required:**

    `question_id=[string]`

    `answer_id=[string]`

    **Optional:**

    None

-   **Data Params**

    None

-   **Success Response:**

    -   **Code:** 204 No Content
        **Content:** None

-   **Error Response:**

    -   **Code:** 401 Unauthorized
        **Content:** `{ error: "Voting is not enabled for this question" }`

    OR

    -   **Code:** 404 Not Found
        **Content:** `{ error: "The question with the requested ID does not exist" }`

    OR

    -   **Code:** 404 Not Found
        **Content:** `{ error: "The answer with the requested ID does not exist" }`

-   **Sample Call:**

```bash
curl --request POST localhost:8080/api/votes/i0o3g53q/t9i2gbw7
```

-   **Notes:**

    None

---
