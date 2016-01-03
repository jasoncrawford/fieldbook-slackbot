var _ = require('underscore');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var requestify = require('requestify');

var MockClient = require('./mockClient');
var app = require('../app');
var commands = require('../app/commands');

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

before(function () {
  mockClient.setMockRecords('items', [
    {id: 1, name: "Write interface design", pri: 1, status: "done", owner: "Jason"},
    {id: 2, name: "Draft industry analysis", pri: 2, status: "working", owner: "Ben"},
  ])
})

describe('List', function () {
  var expectedText = "1 Write interface design\n2 Draft industry analysis";

  describe('when you send the default command', function () {
    before(function () {
      response = makeRequest();
    })

    it('should return a list of records', function () {
      return expect(response.get('body')).to.eventually.equal(expectedText);
    })
  })

  describe('when you send an explicit list command', function () {
    before(function () {
      response = makeRequest({text: 'list'});
    })

    it('should return a list of records', function () {
      return expect(response.get('body')).to.eventually.equal(expectedText);
    })
  })
})

describe('Show', function () {
  describe('when you show an item', function () {
    before(function () {
      response = makeRequest({text: 'show 1'});
    })

    it('should return item detail', function () {
      return expect(response.get('body')).eventually.equal("ID: 1\nName: Write interface design\nPri: 1\nStatus: done\nOwner: Jason");
    })
  })
})

describe('Errors', function () {
  describe('when you send an unknown command', function () {
    before(function () {
      response = makeRequest({text: 'bogus'});
    })

    it('should return an error', function () {
      return expect(response.get('body')).to.eventually.match(/don't know/);
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
})
