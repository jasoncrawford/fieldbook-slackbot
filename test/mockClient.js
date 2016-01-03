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
}

module.exports = MockClient;
