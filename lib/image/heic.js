const async = require('async')
const childProcess = require('child_process')
const path = require('path')
const tmp = require('tmp')
const trace = require('debug')('thumbsup:trace')

// IMPORTANT NOTE
//
// We rely on GraphicsMagick for all image processing, and ImageMagick 7 to convert HEIC to JPEG
// Here is why:
//
// - Could we use GraphicsMagick for HEIC files?
//   * it doesn't support HEIC yet, and the roadmap is not public
//
// - Could we use Tifig (https://github.com/monostream/tifig)?
//   * it only supports HEIC files from iOS
//   * doesn't work on the Nokia HEIC examples (http://nokiatech.github.io/heif/examples.html)
//   * it's not maintained anymore
//
// - Could we use ImageMagick for everything
//   * that would be ideal
//   * it's reportedly slower, so we would need to benchmark it
//   * all the existing GraphicsMagick code would have to be converted
//   * the <gm> package supports ImageMagick, but after a quick test watermarks didn't work out-of-the-box
//
// Anyway it might have to be a 2-step process to convert the color profile before downsizing
//

const SRGB_ICM_PATH = path.join(__dirname, 'sRGB.icm')
const processed = {}

// This function is typically called several times, for the thumbnail, small version, large version...
// To avoid converting the image 3 times we re-use previously converted images
exports.convert = function (source, callback) {
  if (!processed[source]) {
    const tmpfile = tmp.fileSync({ postfix: '.jpg' })
    processed[source] = processFile(source, tmpfile.name)
  }
  processed[source].then((target) => callback(null, target)).catch(err => callback(err))
}

// Return a promise so multiple callers can subscribe to when it's finished
function processFile (source, target) {
  return async.series([
    done => convertToJpeg(source, target, done),
    done => copyColorProfile(source, target, done),
    done => convertToSRGB(target, done)
  ]).then(() => target)
}

function convertToJpeg (source, target, done) {
  // only process the first image, in case of burst shots
  const args = ['convert', `${source}[0]`, target]
  exec('magick', args, done)
}

function copyColorProfile (source, target, done) {
  const args = ['-overwrite_original', '-TagsFromFile', source, '-icc_profile', target]
  exec('exiftool', args, done)
}

function convertToSRGB (target, done) {
  const args = ['mogrify', '-profile', SRGB_ICM_PATH, target]
  exec('magick', args, done)
}

function exec (command, args, done) {
  trace(command + ' ' + args.map(a => `"${a}"`).join(' '))
  childProcess.execFile(command, args, done)
}

// Optionally, we could remove the original profile
// It shouldn't matter since we're resizing the image afterwards
// exiftool -overwrite_original "-icc_profile:all=" photo.jpg
