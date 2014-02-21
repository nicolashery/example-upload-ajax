# Simple file upload with Ajax and Node.js

This is an exploration of how to upload a file using different transports:

- `FormData` (available in modern browsers) and `XMLHttpRequest` (Ajax)
- "Traditional" `POST` but with the form's `target` set to a hidden iframe (to not trigger a page refresh)

## Quickstart

Clone this repository and install dependencies:

```bash
$ npm install
```

Start the server:

```bash
$ node server
```

Go to `http://localhost:8081/`.

**NOTE**: To parse HTTP requests with incoming `multipart/form-data`, by default the server uses [busboy](https://github.com/mscdex/busboy), which seems the preferred solution at the time of writing. It also has an implementation with [node-multiparty](https://github.com/andrewrk/node-multiparty/), which you can use by running `node server multiparty`.