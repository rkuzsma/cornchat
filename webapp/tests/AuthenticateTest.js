/* @flow */

import assert from "assert";

import {lambdaPromisifier} from "../lib/lambda-promisifier.js"
import {Authenticate} from "../lambda/Authenticate.js"

const promisifiedLogin = lambdaPromisifier(Authenticate);

describe("Authenticate lambda", function() {
  it("should Authenticate with a valid hipchat user", function(done) {
    promisifiedLogin({hipchatUserId: "valid", hipchatOauthToken: "valid"})
    .then(res => {
      assert.equal(res, "TODO Fill me in")
    })
    .then(() => done(), done);
  });

  it("should not Authenticate with an invalid hipchat user", function(done) {
    promisifiedLogin({hipchatUserId: "invalid", hipchatOauthToken: "invalid"})
    .then(res => {
      assert.equal(res, "TODO Fill me in")
    })
    .then(() => done(), done);
  });
});
