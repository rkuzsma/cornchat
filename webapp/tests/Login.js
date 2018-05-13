/* @flow */

import assert from "assert";

import {lambdaPromisifier} from "../lib/lambda-promisifier.js"
import {Login} from "../lambda/Login.js"

const promisifiedLogin = lambdaPromisifier(Login);

describe("Login lambda", function() {
  it("should login with a valid API token", function(done) {
    promisifiedLogin({apiToken: "valid"})
    .then(res => {
      assert.equal(res, "TODO Fill me in")
    })
    .then(() => done(), done);
  });

  it("should not login with an invalid API token", function(done) {
    promisifiedLogin({apiToken: "invalid"})
    .then(res => {
      assert.equal(res, "TODO Fill me in")
    })
    .then(() => done(), done);
  });
});
