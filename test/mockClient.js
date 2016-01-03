var _ = require('underscore');
var Q = require('q');

class MockClient {
  constructor() {
    this.mockRecords = {};
  }

  setMockRecords(sheet, records) {
    this.mockRecords[sheet] = records;
  }

  list(sheet) {
    return Q(this.mockRecords[sheet]);
  }

  show(sheet, id) {
    id = parseInt(id);
    var records = this.mockRecords[sheet];
    return Q(_.findWhere(records, {id: id}));
  }
}

module.exports = MockClient;
