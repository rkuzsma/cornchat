import showBar from './bar';
import log from './logger';
import logo from './logo';

// The app's main run loop. App-Loader invokes the loop iteratively.
export default function runOneLoop() {
  try {
    log("Hello world!");
    logo();
  }
  catch(err) {
    log("ERROR: " + err);
  }
}
