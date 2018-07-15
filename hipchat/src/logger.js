export default function log(str) {
  if (window.macapi) {
    window.macapi.log("[CORNCHAT]: " + str);
  }
  else {
    console.debug("[CORNCHAT]: " + str);
  }
}
