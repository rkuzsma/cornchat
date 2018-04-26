export default {
  // TODO  Speed up the interval once better caching of tags is in place.
  tag_fetch_loop_interval: 50000,
  msg_elements_dom_watch_interval: 3000,
  dev_url: "https://localhost:8080/bundle.js",
  learn_more_url: "https://github.com/rkuzsma/cornchat",
  create_account_url: "https://cornchat.s3.amazonaws.com/signup.html",
  cornchat_identity_pool_id: 'us-east-1:83c77c52-ef3f-4e51-bf39-d682eda27aad',
  // TODO: Increase from 60s to 50 minutes for prod
  authentication_timeout_ms: 60000
}
