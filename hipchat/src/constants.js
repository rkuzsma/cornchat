const constants = {
  // TODO  Speed up the interval once better caching of tags is in place.
  tag_fetch_loop_interval: 10000,
  msg_elements_dom_watch_interval: 3000,
  dev_url: "https://localhost:8080/bundle.js",
  learn_more_url: "https://github.com/rkuzsma/cornchat",
  create_account_url: "https://cornchat.s3.amazonaws.com/signup.html",
  // TODO: Increase from 60s to 50 minutes for prod
  authentication_timeout_ms: 60000
}

export default constants;
