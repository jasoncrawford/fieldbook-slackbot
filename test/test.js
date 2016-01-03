var _ = require('underscore');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var requestify = require('requestify');

var MockClient = require('./mockClient');
var app = require('../app');
var commands = require('../commands');

chai.use(chaiAsPromised);
var expect = chai.expect;

var mockClient = new MockClient();
commands.client = mockClient;

function makeRequest(body) {
  body = body || {};
  body = _.defaults(body, {
    token: process.env['SLACK_COMMAND_TOKEN'],
    user_name: 'user',
    command: '/tasks',
    text: ''
  });

  return requestify.post(`http://localhost:${app.port}/commands`, body, {dataType: 'form-url-encoded'});
}

var response;

describe('when you send a command', function () {
  before(function () {
    mockClient.setMockRecords('items', [
      {id: 1, name: "Foo"},
      {id: 2, name: "Bar"},
    ])
  })

  before(function () {
    response = makeRequest();
  })

  it('should return a list of records', function () {
    return expect(response.get('body')).to.eventually.equal("1 Foo\n2 Bar");
  })
})

describe('when you send a command with a bad token', function () {
  before(function () {
    response = makeRequest({token: 'bogus'});
  })

  it('should return an error', function () {
    return expect(response).rejected;
  })

  it('should return 403 Forbidden', function () {
    return response.fail(function (response) {
      expect(response.getCode()).equal(403);
    })
  })
})
