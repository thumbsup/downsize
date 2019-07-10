const fs = require('fs-extra')
const path = require('path')

module.exports = async () => {
  // Clean up test data before the tests run
  const actual = path.join(__dirname, '..', 'test-data', 'actual')
  await fs.emptyDir(actual)
}
