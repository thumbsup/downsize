const childProcess = require('child_process')
const trace = require('debug')('thumbsup:trace')

exports.getDuration = function (src, callback) {
  const args = [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    src
  ]
  trace('ffprobe ' + args.map(a => `"${a}"`).join(' '))
  childProcess.execFile('ffprobe', args, (error, stdout) => {
    trace('ffprobe: ' + stdout)
    if (error) return callback(error)
    const duration = parseFloat(stdout)
    if (Number.isNaN(duration)) {
      callback(new Error('Invalid output'))
    } else {
      callback(null, Math.floor(duration * 10) / 10)
    }
  })
}
