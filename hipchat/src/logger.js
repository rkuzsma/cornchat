'use strict';

export default function log(str) {
  if (window.macapi) {
    window.macapi.log("[CORNCHAT]: " + str);
  }
  else {
    console.log("[CORNCHAT]: " + str);
  }
}
