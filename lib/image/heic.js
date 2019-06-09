const childProcess = require('child_process')
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

exports.convert = (source, target, callback) => {
  const args = [ 'convert', source, target ]
  trace('magick ' + args.map(a => `"${a}"`).join(' '))
  childProcess.execFile('magick', args, callback)
}
