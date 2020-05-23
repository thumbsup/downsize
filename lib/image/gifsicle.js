const childProcess = require('child_process')
const trace = require('debug')('thumbsup:trace')
const GIF_FILE = /\.gif$/i

exports.createAnimatedGif = (source, target, options, callback) => {
  if (!target.match(GIF_FILE)) {
    throw new Error(`Target should have the <gif> extension but was: ${target}`)
  }
  if (options.width && options.height) {
    throw new Error(`Cannot crop a GIF image while keeping the animation: ${target}`)
  }
  const resize = `${options.width || '_'}x${options.height || '_'}`
  const args = ['-O2', '--resize-fit', resize, '-o', target, source]
  trace('gifsicle ' + args.map(a => `"${a}"`).join(' '))
  return childProcess.execFile('gifsicle', args, callback)
}
