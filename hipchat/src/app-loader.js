import runOneLoop from './app';
import settings from './settings';

// The app-loader runs the app loop repeatedly every loop_interval millis.
// For dev, run dev server with "npm run start:dev" to
// re-load the entire app bundle each loop.
(function () {

  // Normal webpack-dev-server HMR couldn't reload the asset on HipChat.
  // Workaround is to just check for new code every loop.
  if (module.hot) { // run with "npm run start:dev" to enable
    window.setTimeout(function(){

      // e.g. https://localhost:8080/bundle.js
      $.get(settings.dev_url, function() {
        runOneLoop();
      })
      .fail(function(err) {
        alert( "CornChat: Hot reload error: " + JSON.stringify(err));
      });

    }, settings.loop_interval);
  }
  else {
    window.setInterval(function(){

      runOneLoop();

    }, settings.loop_interval);
  }

})();
