import runOneLoop from './app';

// The app-loader runs the app loop repeatedly every LOOP_INTERVAL millis.
// For dev, run dev server with "npm run start:dev -- --hot" to
// re-load the entire app bundle each loop.
(function () {
  var LOOP_INTERVAL = 2000;

  // Normal webpack-dev-server HMR couldn't reload the asset on HipChat.
  // Workaround is to just check for new code every loop.
  if (module.hot) { // run with "npm run start:dev -- --hot" to enable
    window.setTimeout(function(){

      $.get( "https://localhost:8080/bundle.js", function() {
        runOneLoop();
      })
      .fail(function(err) {
        alert( "CornChat: Hot reload error: " + JSON.stringify(err));
      });

    }, LOOP_INTERVAL);
  }
  else {
    window.setInterval(function(){

      runOneLoop();

    }, LOOP_INTERVAL);
  }

})();
