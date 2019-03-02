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

You can find detailed API documentation [here](docs/API.md).

## Glossary

-   **Poll**: A combination of a _Question_, _Answers_, and _Votes_
-   **Question**: The question that a user wants to ask. Acts as the description text of a poll. An example for a question would be: "Which team do you think will win?" Several attributes are associated with a question that determine how the poll behaves. A question can also have answers associated with it.
-   **Answer**: A single entry, belonging to a question, that users can vote for. Continuing our example, an answer could be: "Blue Team". An answer can have zero or more votes.
-   **Vote**: A single vote for a single answer.
-   **Vote Protection**: Methods that prevent users from voting on the same poll twice.
-   **Question Token**: A secret token that allows the user to edit a poll. Example actions which require a question token are: adding an answer to a question, deleting a question. Voting does not require the question token.

## License

Votr is licensed under [MIT license](LICENSE).
