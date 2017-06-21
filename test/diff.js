const gm = require('gm')
const convert = require('../lib/index')

const TOLERANCE = { tolerance: 0.005 }

// process an image, and compare to the expected output
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

// extract a video still, and compare to the expected image output
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

// process a video, and compare to a reference video output (comparing a single frame)
exports.video = function (test, args) {
  const input = `test-data/input/${args.input}`
  const actual = `test-data/actual/${args.expect}`
  const expected = `test-data/expected/${args.expect}`
  convert.video(input, actual, args.options, (err) => {
      if (err) return test.end(err)
      convert.still(actual, `${actual}.jpg`, args.options, (err) => {
          if (err) return test.end(err)
          compareImage(test, `${expected}.jpg`, `${actual}.jpg`)
        }
      )
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
