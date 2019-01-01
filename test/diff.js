const _ = require('lodash')
const childProcess = require('child_process')
const gm = require('gm')
const convert = require('../lib/index')

// process an image, and compare to the expected output
exports.image = function (test, args) {
  const input = `test-data/input/${args.input}`
  const actual = `test-data/actual/${args.expect}`
  const expected = `test-data/expected/${args.expect}`
  convert.image(input, actual, args.options, (err) => {
    if (err) return test.end(err)
    compareImage(test, expected, actual)
  })
}

// extract a video still, and compare to the expected image output
exports.still = function (test, args) {
  const input = `test-data/input/${args.input}`
  const actual = `test-data/actual/${args.expect}`
  const expected = `test-data/expected/${args.expect}`
  convert.still(input, actual, args.options, (err) => {
    if (err) return test.end(err)
    compareImage(test, expected, actual)
  })
}

// process a video, and compare to a reference video output (comparing a single frame)
exports.video = function (test, args) {
  const input = `test-data/input/${args.input}`
  const actual = `test-data/actual/${args.expect}`
  const expected = `test-data/expected/${args.expect}`
  convert.video(input, actual, args.options, (err) => {
    if (err) return test.end(err)
    convert.still(actual, `${actual}.jpg`, {}, (err) => {
      if (err) return test.end(err)
      compareImage(test, `${expected}.jpg`, `${actual}.jpg`)
    })
  })
}

function compareImage (test, expected, actual) {
  const isGif = actual.match(/\.gif$/i)
  test.test('metadata', t => {
    const fields = isGif ? ['AnimationIterations', 'FrameCount', 'Duration', 'ImageSize'] : ['ImageSize', 'Megapixels']
    compareMetadata(t, expected, actual, fields)
  })
  test.test('visual', t => {
    // We have to be less picky when comparing GIFs
    // because Gifsicle produces slightly different results between versions
    const tolerance = isGif ? 0.3 : 0.001
    compareVisual(t, expected, actual, tolerance)
  })
}

function compareMetadata (test, expected, actual, fields) {
  try {
    test.deepEqual(
      _.pick(exiftool(actual), fields),
      _.pick(exiftool(expected), fields),
      `${actual} has same metadata as expected`
    )
    test.end()
  } catch (ex) {
    test.end(`exiftool failed to get metadata`)
  }
}

function compareVisual (test, expected, actual, tolerance) {
  gm.compare(expected, actual, tolerance, (err, similar, equality) => {
    if (err) return test.end(err)
    if (!similar) return test.end(`${actual} is visually different from expected (equality=${equality})`)
    test.pass(`${actual} is visually similar to expected`)
    test.end()
  })
}

function exiftool (imagePath) {
  const output = childProcess.execSync(`exiftool -j ${imagePath}`)
  return JSON.parse(output)[0]
}
