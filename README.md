# CornChat

Get the HipChat features you've always wanted!
* Tag and filter individual message threads
* Use Github-Flavored Markdown
* React to individual messages with Emoji

Learn more at [https://www.cornchat.online/](https://www.cornchat.online/).

## Install

### HipChat Browser Installation

Login to your HipChat app and run this command to inject CornChat onto the page:

```javascript
var cornchat = document.createElement('script');
cornchat.setAttribute('src','https://builds.cornchat.online/ProdCornChat-bundle.js');
document.head.appendChild(cornchat);
```

### HipChat for Mac

Open `/Applications/HipChat.app/Contents/Resources/chat.html` and add this line at the bottom:

```
<script src="https://builds.cornchat.online/ProdCornChat-bundle.js"></script>
```

## How it Works

CornChat runs as a JavaScript bundle injected into your HipChat UI. It stores your tags and reactions using a private AWS AppSync server and authenticates you using your HipChat OAuth token. CornChat uses technologies like React, Apollo, GraphQL, Webpack, DynamoDB, AWS AppSync, Lambda, VTL, CloudFormation and ESH. [Learn more about how it works underneath](https://www.cornchat.online/how-it-works.html).


## Development Setup - Front-End

Use these steps to point HipChat at your local CornChat source code, instead of the released version.

Run:
```
cd hipchat
nvm use
npm install
npm run generate-dev-certs
npm run trust-dev-certs
npm run start:dev -- --hot
```

CornChat bundle is served from: [https://localhost:8080/TestCornChat-bundle.js](https://localhost:8080/TestCornChat-bundle.js).

The development bundle connects to the `TestCornChat` AWS CloudFormation stack on the back-end. The production bundle (`npm run build:prod`) connects to the `ProdCornChat` AWS CloudFormation stack. You can connect to a different stack by setting the `CORNCHAT_APP_NAME` environment variable to the CloudFormation stack name.


### Debugging in the HipChat Web UI (Preferred)

Browse to [https://localhost:8080/TestCornChat-bundle.js](https://localhost:8080/TestCornChat-bundle.js) and accept the TLS cert.

Login to the HipChat web URL and run this in the dev tools console:
```
var cornchat = document.createElement('script');
cornchat.setAttribute('src','https://localhost:8080/TestCornChat-bundle.js');
document.head.appendChild(cornchat);
```

_Note: Hot Module Replacement only works in the Web UI, not in the Mac app._


### Debugging in HipChat for Mac

Open `/Applications/HipChat.app/Contents/Resources/chat.html` and add this line at the bottom:

```
<script src="https://localhost:8080/TestCornChat-bundle.js"></script>
```

Start HipChat.

Click **Help**, **Open Current Log File** to view CornChat debug log messages.


### Deploy - Front-End

The dev and production bundles are deployed to github pages:
* [https://rkuzsma.github.io/cornchat/TestCornChat-bundle.js](https://rkuzsma.github.io/cornchat/TestCornChat-bundle.js)
* [https://rkuzsma.github.io/cornchat/ProdCornChat-bundle.js](https://rkuzsma.github.io/cornchat/ProdCornChat-bundle.js)

The `cornchat.online` domain has CNAME records configured with Github-provisioned LetsEncrypt TLS certificates pointing at the website and bundle release builds domains, e.g.:
* [https://builds.cornchat.online/TestCornChat-bundle.js](https://builds.cornchat.online/TestCornChat-bundle.js)
* [https://builds.cornchat.online/ProdCornChat-bundle.js](https://builds.cornchat.online/ProdCornChat-bundle.js)
* [https://www.cornchat.online/index.html](https://www.cornchat.online/index.html)

Build and deploy for dev and production to your github repo using:
```
cd hipchat
npm run build:dev
npm run build:prod
npm run deploy
```


### Deploy - Back-End

Deploy all back-end services as a self-contained, named AWS CloudFormation stack by running:
```
cd webapp
./stack-deploy.sh TestCornChat
```

Set `TestCornChat` to the name of the CloudFormation stack to update or create.

The CloudFormation template writes public and private configuration data to an S3 bucket. Override the S3 bucket and folder paths before running `./stack-deploy.sh` by setting:
```
export S3_BUCKET=AWS Bucket Name
export S3_PRIVATE_FOLDER=Folder in S3_BUCKET to use for storage of private config
export S3_PUBLIC_FOLDER=Folder in S3_BUCKET to use for storage of public-readable config
```

At the end of deployment, the CloudFormation stack [populates](https://github.com/rkuzsma/cornchat/blob/master/webapp/cloudformation/templates/template.yaml#L505) the `S3_BUCKET/S3_PUBLIC_FOLDER` with the Graph QL API endpoint URL and Identity Pool ID. The [Front-End build](https://github.com/rkuzsma/cornchat/blob/master/hipchat/webpack.common.js#L19) fetches the Graph QL API and Identity Pool ID from this bucket.


### License

CornChat is [free](https://github.com/rkuzsma/cornchat/) and [open source](https://github.com/rkuzsma/cornchat) forever.

Reactions, tags, and HipChat message IDs are stored on the CornChat AWS cloud. No guarantees for uptime or data loss. You can always host CornChat yourself if the free, public, hosted version isn't sufficient.


# Cure Cancer

Like CornChat? Hate Cancer? Please help my daughter Quinn and [donate 5 bucks to Alex’s Lemonade Stand](https://www.alexslemonade.org/mypage/1455792/donate/nojs). Don’t think too hard about it, just do it. It takes 2 minutes and the payment form is beautifully designed. You'll feel great doing it.
