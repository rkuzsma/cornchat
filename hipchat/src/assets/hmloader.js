window.setInterval(function(){
  function reload_js(src) {
      $('script[src="' + src + '"]').remove();
      $('<script>').attr('src', src).appendTo('head');
  }
  reload_js('https://localhost:8080/bundle.js');
}, 500);
