# cornchat

## Development Setup

Use these steps to point HipChat at your local CornChat source code, instead of the released version.
```
nvm use
npm install
npm run generate-dev-certs
npm run trust-dev-certs
npm run start:dev
```

CornChat bundle served from:
https://localhost:8080/bundle.js
Quick test:
https://localhost:8080/healthcheck.js

Start HipChat. You'll get hot module replacement, too.
