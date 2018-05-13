const async = require('async')
const gm = require('gm')
const mkdirp = require('mkdirp')
const path = require('path')
const gmargs = require('./gmargs')
const ffmpeg = require('./ffmpeg')

/*
  Convert and/or resize an image
*/
exports.image = function (source, target, options, callback) {
  // create target folder if needed
  mkdirp.sync(path.dirname(target))
  // read baked-in orientation info, and output a rotated image with orientation=0
  const image = gm(source)
  image.autoOrient()
  // optional watermark
  const cropping = options.width && options.height
  if (options.watermark && !cropping) {
    image.composite(options.watermark.file)
    if (options.watermark.tile) {
      image.tile(options.watermark.file)
    }
    if (options.watermark.gravity) {
      image.gravity(options.watermark.gravity)
    } else {
      image.gravity('SouthEast')
    }
  }
  // resize if necessary
  if (options.width && options.height) {
    // crop to the exact height and weight
    image.resize(options.width, options.height, '^')
    image.gravity('Center')
    image.crop(options.width, options.height)
  } else if (options.height) {
    // resize to a maximum height
    image.resize(null, options.height, '>')
  } else if (options.width) {
    // resize to a maximum width
    image.resize(options.width, null, '>')
  }
  // default quality, for typical web-friendly sizes
  image.quality(options.quality || 90)
  // apply custom post-processing arguments (sharpen, brightness...)
  gmargs.apply(image, options.args)
  // write the output image
  image.write(target, callback)
}

/*
  Transcode and/or downsample a video
*/

exports.video = function (source, target, options, callback) {
  // create target folder if needed
  mkdirp.sync(path.dirname(target))
  // always output to mp4 which is well read on the web
  const args = ['-i', source, '-y', target, '-f', 'mp4', '-vcodec', 'libx264', '-ab', '96k']
  // AVCHD/MTS videos need a full-frame export to avoid interlacing artefacts
  if (path.extname(source).toLowerCase() === '.mts') {
    args.push('-vf', 'yadif=1', '-qscale:v', '4')
  } else {
    args.push('-vb', '1200k')
  }
  // return a EventEmitter to follow progress, since this can take a long time
  return ffmpeg.exec(args, callback)
}

/*
  Extract and resize a still frame from a video
*/
exports.still = function (source, target, options, callback) {
  // create target folder if needed
  mkdirp.sync(path.dirname(target))
  async.series([
    (next) => extractFrame(source, target, next),
    (next) => exports.image(target, target, options, next)
  ], callback)
}

function extractFrame (source, target, callback) {
  const args = ['-ss', '0.1', '-i', source, '-vframes', 1, '-y', target]
  ffmpeg.exec(args, callback)
}
