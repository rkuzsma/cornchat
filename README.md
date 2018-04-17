# cornchat

## Install

Open `/Applications/HipChat.app/Contents/Resources/chat.html` and add these lines at the bottom:

```
<link href="https://rkuzsma.github.io/cornchat/cornchat.css" rel="stylesheet" type="text/css">
<script src="https://rkuzsma.github.io/cornchat/bundle.js"></script>
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

To debug in the HipChat Web UI, load the HipChat web app and run this in the console:
```
var cornstyles = document.createElement('link');
cornstyles.setAttribute('href', 'https://localhost:8080/cornchat.css');
cornstyles.setAttribute('rel', 'stylesheet');
cornstyles.setAttribute('type', 'text/css');
document.head.appendChild(cornstyles);
var cornchat = document.createElement('script');
cornchat.setAttribute('src','https://localhost:8080/bundle.js');
document.head.appendChild(cornchat);
```
You'll need to browse to `https://localhost:8080/bundle.js` and accept the TLS cert, first.

### Deploy
The app is hosted on github pages:
https://rkuzsma.github.io/cornchat/bundle.js

Build and deploy for production using:
```
npm run build
npm run deploy
```
