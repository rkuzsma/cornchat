'use strict';

import log from './logger';
import Constants from './constants';
import foo from './app-loop';
// The app-loader runs the app loop repeatedly every loop_interval millis.
// For dev, run dev server with "npm run start:dev" to
// re-load the entire app bundle each loop.
(function () {
/*
  // Normal webpack-dev-server HMR couldn't reload the asset on HipChat.
  // Workaround is to just check for new code every loop.
  if (module.hot) { // run with "npm run start:dev" to enable
    log("Hot Module Replacement enabled");

    window.setTimeout(function(){

      // Re-load entire app bundle, which will re-load app-loader.
      // e.g. https://localhost:8080/bundle.js
      $.get(constants.dev_url, function() {
        runOneLoop();
      })
      .fail(function(err) {
        alert( "CornChat: Hot reload error: " + JSON.stringify(err));
      });

    }, Constants.loop_interval);
  }
  else {
  */

    log("Hello 1");
    if (module.hot) { // run with "npm run start:dev" to enable
      log("Hot Module Replacement enabled");
      module.hot.accept();

      // In a browser, e.g. https://localhost:8080/test.html, HMR works as expected.
      // In the HipChat browser, HMR doesn't reload the script.
      // So we force the reload here.
      window.setInterval(function(){
          try {
            log("replacing");
            //delete require.cache[require.resolve("./app-loop")];

            import('./app-loop').then(runOneLoop => {
              log("running...");
              runOneLoop();
              log("ran");
            });
            log('done');
          }
          catch(err) {
            log("err: " + err);
          }
      },1000);

    }


/*
    window.setInterval(function(){
      runOneLoop();
    }, Constants.loop_interval);

    */

  //}

})();
