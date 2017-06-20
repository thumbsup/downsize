const gm = require('gm')
const convert = require('../lib/index')

const TOLERANCE = { tolerance: 0.005 }

exports.image = function (test, args) {
  const input = `test-data/input/${args.input}`
  const actual = `test-data/actual/${args.expect}`
  const expected = `test-data/expected/${args.expect}`
  convert.image(input, actual, args.options, (err) => {
      if (err) return test.end(err)
      compareImage(test, expected, actual)
    }
  )
}

exports.still = function (test, args) {
  const input = `test-data/input/${args.input}`
  const actual = `test-data/actual/${args.expect}`
  const expected = `test-data/expected/${args.expect}`
  convert.still(input, actual, args.options, (err) => {
      if (err) return test.end(err)
      compareImage(test, expected, actual)
    }
  )
}

function compareImage (test, expected, actual) {
  gm.compare(expected, actual, TOLERANCE, (err, similar) => {
    if (err) return test.end(err)
    if (!similar) return test.end(`${expected} is different from expected`)
    test.pass(`${expected} is as expected`)
    test.end()
  })
}
