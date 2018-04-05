# cornchat

## Installation

Open `/Applications/HipChat.app/Contents/Resources/chat.html` and add these lines at the bottom:

TODO Replace these links with the github links.
```
<link href="https://localhost:8080/cornchat.css" rel="stylesheet" type="text/css">
<script src="https://localhost:8080/bundle.js"></script>
```


## Development Setup

Use these steps to point HipChat at your local CornChat source code, instead of the released version.

Open `/Applications/HipChat.app/Contents/Resources/chat.html` and add these lines at the bottom:

```
<link href="https://localhost:8080/cornchat.css" rel="stylesheet" type="text/css">
<script src="https://localhost:8080/bundle.js"></script>
```

Run:
```
nvm use
npm install
npm run generate-dev-certs
npm run trust-dev-certs
npm run start:dev -- --hot
```

CornChat bundle served from:
https://localhost:8080/bundle.js

Quick test:
https://localhost:8080/healthcheck.js

Start HipChat. You'll get hot module replacement, too.
