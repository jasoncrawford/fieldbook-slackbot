var url = require('url');
var requestify = require('requestify');

class Client {
  constructor(options) {
    this.key = options.key;
    this.secret = options.secret;
    this.baseUrl = `https://api.fieldbook.com/v1/${options.bookId}/`;
  }

  request(path, options) {
    options.headers = {accept: 'application/json'};
    options.auth = {username: this.key, password: this.secret};
    var requestUrl = url.resolve(this.baseUrl, path);
    return requestify.request(requestUrl, options).then(response => JSON.parse(response.body));
  }

  list(sheet) {
    return this.request(sheet, {method: 'GET'});
  }
}

module.exports = Client;
