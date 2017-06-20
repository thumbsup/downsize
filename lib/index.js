const async = require('async')
const childProcess = require('child_process')
const gm = require('gm')
const mkdirp = require('mkdirp')
const path = require('path')

/*
  Convert and/or resize an image
*/
exports.image = function (source, target, options, callback) {
  // create target folder if needed
  mkdirp.sync(path.dirname(target))
  // read baked-in orientation info, and output a rotated image with orientation=0
  const image = gm(source)
  image.autoOrient()
  // resize if necessary
  if (options.height && options.width) {
    // crop to the exact height and weight
    image.resize(options.height, options.width, '^')
    image.gravity('Center')
    image.crop(options.height, options.width)
  } else if (options.height) {
    // resize to a maximum height
    image.resize(options.height, null, '>')
  } else if (options.width) {
    // resize to a maximum width
    image.resize(null, options.width, '>')
  }
  // default quality, for typical web-friendly sizes
  image.quality(options.quality || 90)
  // write the output image
  image.write(target, callback)
}

/*
  Transcode and/or downsample a video
*/

exports.video = function (source, target, options, callback) {
  // create target folder if needed
  mkdirp.sync(path.dirname(target))
  // create target folder if needed
  mkdirp.sync(path.dirname(target))
  // always output to mp4 which is well read on the web
  const args = ['-i', source, '-y', target, '-f', 'mp4', '-vcodec', 'libx264', '-ab', '96k']
  // AVCHD/MTS videos need a full-frame export to avoid interlacing artefacts
  if (path.extname(src).toLowerCase() === '.mts') {
    args.push('-vf', 'yadif=1', '-qscale:v', '4')
  } else {
    args.push('-vb', '1200k')
  }
  exec('ffmpeg', args, callback)
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
  const args = ['-itsoffset', '-1', '-i', source, '-ss', '0.1', '-vframes', 1, '-y', target]
  exec('ffmpeg', args, callback)
}

function exec (command, args, callback) {
  const child = childProcess.spawn(command, args, {
    stdio: 'ignore'
  })
  child.on('error', err => callback(err))
  child.on('exit', (code, signal) => {
    if (code > 0) callback(new Error(`${command} exited with code ${code}`))
    else callback(null)
  })
}
