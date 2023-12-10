const path = require('node:path')
const fs = require('fs-extra')

module.exports = async () => {
  // Clean up test data before the tests run
  const actual = path.join(__dirname, '..', 'test-data', 'actual')
  await fs.emptyDir(actual)
}
