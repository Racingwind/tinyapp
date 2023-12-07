const { assert } = require('chai');

const helpers = require("../helpers");

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
};

describe('userLookupByEmail', () => {
  it('should return a user with valid email', () => {
    const user = helpers.userLookupByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null with invalid email', () => {
    const user = helpers.userLookupByEmail("user3@example.com", testUsers);
    const expectedUserID = null;
    assert.strictEqual(user, expectedUserID);
  });

});

describe('urlsForUser', () => {
  it('should return an object list of urls with the given user id if it that has urls matching that id', () => {
    const list = helpers.urlsForUser("userRandomID", testDatabase);
    const expectedList = { "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" }, "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" } };
    assert.deepEqual(list, expectedList);
  });

  it('should return an empty object list of urls with the given user id if has no urls matching that id', () => {
    const list = helpers.urlsForUser(undefined, testDatabase);
    const expectedList = {};
    assert.deepEqual(list, expectedList);
  });

});