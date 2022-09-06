const _ = require('lodash')
const should = require('should/as-function')
const childProcess = require('child_process')
const gm = require('gm')
const convert = require('../../lib/index')

// process an image, and compare to the expected output
exports.image = function (args, done) {
  const input = `test-data/input/${args.input}`
  const actual = `test-data/actual/${args.expect}`
  const expected = `test-data/expected/${args.expect}`
  convert.image(input, actual, args.options, (err) => {
    if (err) throw err
    compareImage(expected, actual, done)
  })
}

// extract a video still, and compare to the expected image output
exports.still = function (args, done) {
  const input = `test-data/input/${args.input}`
  const actual = `test-data/actual/${args.expect}`
  const expected = `test-data/expected/${args.expect}`
  convert.still(input, actual, args.options, err => {
    if (err) throw err
    compareImage(expected, actual, done)
  })
}

// process a video, and compare to a reference video output (comparing a single frame)
exports.video = function (args, done) {
  const input = `test-data/input/${args.input}`
  const actual = `test-data/actual/${args.expect}`
  const expected = `test-data/expected/${args.expect}`
  convert.video(input, actual, args.options, err => {
    if (err) throw err
    convert.still(actual, `${actual}.jpg`, {}, err => {
      if (err) throw err
      compareImage(`${expected}.jpg`, `${actual}.jpg`, done)
    })
  })
}

function compareImage (expected, actual, done) {
  const isGif = actual.match(/\.gif$/i)
  // test metadata
  const fields = isGif ? ['AnimationIterations', 'FrameCount', 'Duration', 'ImageSize'] : ['ImageSize', 'Megapixels']
  compareMetadata(expected, actual, fields)
  // test visual differences
  // We have to be less picky when comparing GIFs
  // because Gifsicle produces slightly different results between versions
  const tolerance = isGif ? 0.3 : 0.001
  compareVisual(expected, actual, tolerance, done)
}

function compareMetadata (expected, actual, fields) {
  const expectedFields = _.pick(exiftool(expected), fields)
  const actualFields = _.pick(exiftool(actual), fields)
  should(actualFields).eql(expectedFields)
}

function compareVisual (expected, actual, tolerance, done) {
  gm.compare(expected, actual, tolerance, (err, similar, equality, raw) => {
    if (err) throw err
    should(similar).eql(true, `
      Equality > tolerance (${equality.toFixed(5)} > ${tolerance})
      Raw comparison: ${raw}
    `)
    done()
  })
}

function exiftool (imagePath) {
  const output = childProcess.execSync(`exiftool -j ${imagePath}`)
  return JSON.parse(output)[0]
}
