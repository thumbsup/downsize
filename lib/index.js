const async = require('async')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const gifsicle = require('./image/gifsicle')
const gmagick = require('./image/gmagick')
const heic = require('./image/heic')
const ffmpeg = require('./video/ffmpeg')
const ffprobe = require('./video/ffprobe')
const ffargs = require('./video/ffargs')

const GIF_FILE = /\.gif$/i
const HEIC_FILE = /\.heic$/i
const DEFAULT_STILL_SEEK_SECONDS = 1

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

  // HEIC files must be converted to JPG first
  if (source.match(HEIC_FILE)) {
    return async.waterfall([
      done => heic.convert(source, done),
      (jpgFile, done) => gmagick.prepare(jpgFile, options).write(target, done)
    ], callback)
  }

  // Process regular files
  gmagick.prepare(source, options).write(target, callback)
}

/*
  Transcode and/or downsample a video
*/

exports.video = function (source, target, options, callback) {
  // create target folder if needed
  mkdirp.sync(path.dirname(target))

  // run ffmpeg to create the downsized video
  const args = ffargs.prepare(source, target, options)
  return ffmpeg.exec(args, callback)
}

/*
  Extract and resize a still frame from a video
*/
exports.still = function (source, target, options, callback) {
  // create target folder if needed
  mkdirp.sync(path.dirname(target))
  async.series([
    (next) => extractFrame(source, target, options, next),
    (next) => exports.image(target, target, options, next)
  ], callback)
}

function extractFrame (source, target, options, callback) {
  getSeekPoint(source, options, (_, seekPoint) => {
    const atseek = ['-i', source, '-vframes', 1, '-ss', seekPoint, '-y', target]
    const fallback = ['-i', source, '-vframes', 1, '-y', target]
    ffmpeg.exec(atseek, (err) => {
      if (fs.existsSync(target)) {
        callback(err)
      } else {
        ffmpeg.exec(fallback, callback)
      }
    })
  })
}

function getSeekPoint (source, options, callback) {
  if (typeof options.seek !== 'number') {
    callback(null, DEFAULT_STILL_SEEK_SECONDS)
  } else if (options.seek !== -1) {
    callback(null, options.seek)
  } else {
    ffprobe.getDuration(source, (err, duration) => {
      const seconds = err ? 0 : duration
      callback(null, seconds / 2)
    })
  }
}
