const async = require('async')
const fs = require('fs')
const gm = require('gm')
const mkdirp = require('mkdirp')
const path = require('path')
const gifsicle = require('./gifsicle')
const gmargs = require('./gmargs')
const ffmpeg = require('./ffmpeg')

const GIF_FILE = /\.gif$/i
const DEFAULT_PHOTO_QUALITY = 90 // percent
const DEFAULT_AUDIO_BITRATE = '96k'
const DEFAULT_VIDEO_FPS = 25

/*
  Convert and/or resize an image
*/
exports.image = function (source, target, options, callback) {
  // create target folder if needed
  mkdirp.sync(path.dirname(target))

  // when processing a GIF
  // - if asking for an animated target, process with Gifsicle
  // - otherwise only process the first frame
  if (source.match(GIF_FILE)) {
    if (options.animated) {
      return gifsicle.createAnimatedGif(source, target, options, callback)
    } else {
      source += '[0]'
    }
  }

  // start processing with GraphicsMagick
  const image = gm(source)

  // read baked-in orientation info, and output a rotated image with orientation=0
  image.autoOrient()

  // optional watermark
  const cropping = options.width && options.height
  if (options.watermark && !cropping) {
    image.composite(options.watermark.file)
    if (options.watermark.position === 'Repeat') {
      image.tile(options.watermark.file)
    } else if (typeof options.watermark.position === 'string') {
      image.gravity(options.watermark.position)
    } else {
      image.gravity('SouthEast')
    }
  }

  // resize if necessary
  if (cropping) {
    // crop to the exact height and weight
    image.resize(options.width, options.height, '^')
    image.gravity('Center')
    image.crop(options.width, options.height)
    image.out('+repage')
  } else if (options.height) {
    // resize to a maximum height
    image.resize(null, options.height, '>')
  } else if (options.width) {
    // resize to a maximum width
    image.resize(options.width, null, '>')
  }

  // default quality, for typical web-friendly sizes
  image.quality(options.quality || DEFAULT_PHOTO_QUALITY)
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

  // common options
  const args = ['-i', source, '-r', DEFAULT_VIDEO_FPS, '-vsync', '2', '-movflags', '+faststart', '-ab', DEFAULT_AUDIO_BITRATE]

  // output to mp4 or webm which are well read on the web
  if (options.format === 'webm') {
    args.push('-f', 'webm', '-vcodec', 'libvpx-vp9', '-strict', '-2')
  } else {
    args.push('-f', 'mp4', '-vcodec', 'libx264')
  }

  // set average bitrate or perceptual quality
  if (options.bitrate) {
    args.push('-b:v', options.bitrate)
  } else {
    // TODO: add configurable CRF value
    args.push('-b:v', 0, '-crf', 20)
  }

  // AVCHD/MTS videos need a full-frame export to avoid interlacing artefacts
  if (path.extname(source).toLowerCase() === '.mts') {
    args.push('-vf', 'yadif=1')
  }

  // target filename
  args.push('-y', target)

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
  const args = ['-i', source, '-vframes', 1, '-y', target]
  ffmpeg.exec(['-ss', '0.1'].concat(args), (err) => {
    if (fs.existsSync(target)) {
      callback(err)
    } else {
      ffmpeg.exec(args, callback)
    }
  })
}
