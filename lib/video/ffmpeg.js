const childProcess = require('child_process')
const trace = require('debug')('thumbsup:trace')
const debug = require('debug')('thumbsup:debug')
const EventEmitter = require('events')
const split = require('split')

class ProgressEmitter extends EventEmitter {}

// Duration: 00:01:00.10
// frame= 1240 fps=144 q=28.0 size=    4428kB time=00:00:51.91 bitrate= 698.6kbits/s speed=6.04x

const REGEX_DURATION = /Duration: (\d\d):(\d\d):(\d\d).\d\d/
const REGEX_PROGRESS = /time=(\d\d):(\d\d):(\d\d).\d\d/

exports.exec = function (args, callback) {
  const progressEmitter = new ProgressEmitter()
  var durationSeconds = 0
  trace('ffmpeg ' + args.map(a => `"${a}"`).join(' '))
  const child = childProcess.spawn('ffmpeg', args, {})
  child.stderr.pipe(split()).on('data', (data) => {
    if (!durationSeconds) {
      durationSeconds = parseTime(data, REGEX_DURATION)
    }
    const progressSeconds = parseTime(data, REGEX_PROGRESS)
    if (progressSeconds) {
      const percent = Math.floor(progressSeconds * 100 / durationSeconds)
      progressEmitter.emit('progress', percent)
    }
  })
  child.on('error', err => {
    debug('ffmpeg error:', err)
    callback(err)
  })
  child.on('exit', (code, signal) => {
    trace(`ffmpeg exited with code ${code}`)
    if (code > 0) callback(new Error(`ffmpeg exited with code ${code}`))
    else callback(null)
  })
  return progressEmitter
}

function parseTime (string, regex) {
  const matches = regex.exec(string.toString())
  if (!matches) return null
  const hours = parseInt(matches[1], 10)
  const minutes = parseInt(matches[2], 10)
  const seconds = parseInt(matches[3], 10)
  return (hours * 3600) + (minutes * 60) + seconds
}
