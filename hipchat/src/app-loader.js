import log from './logger';
import React from "react";
import ReactDOM from "react-dom";
import App from './app';

// For dev, run dev server with "npm run start:dev"
(function () {
  log("----------------");
  log("Loading CornChat");
  if (module.hot) { // run with "npm run start:dev" to enable
    module.hot.accept();
    // In a browser, e.g. https://localhost:8080/test.html, HMR works as expected.
    // In the HipChat browser, HMR doesn't reload the script. :(
  }

  $(document).ready(function() {
    log("Loading App");
    try {
      const rootEl = function() {
        var rootEl = document.getElementById('CORN_rootEl');
        if (rootEl) return rootEl;
        rootEl = $("<div id='CORN_rootEl'></div>");
        $('body').append(rootEl);
        return document.getElementById('CORN_rootEl');
      }
      ReactDOM.render(<App />, rootEl());
    }
    catch(err) {
      log("Error rendering app: " + err);
      log(err.stack);
    }
  });

})();
