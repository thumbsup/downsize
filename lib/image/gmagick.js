const gm = require('gm')

const DEFAULT_PHOTO_QUALITY = 90 // percent

exports.prepare = function (source, options) {
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
  exports.addRawArgs(image, options.args)

  return image
}

/*
  Applies an array of GraphicsMagick string arguments to a <gm> instance
  e.g. apply(image, ['--modulate 120'])
*/
exports.addRawArgs = function (image, args) {
  if (args && args.length) {
    args.forEach(arg => {
      const index = arg.indexOf(' ')
      if (index === -1) {
        image.out(arg)
      } else {
        const command = arg.substr(0, index)
        const values = arg.substr(index + 1)
        image.out(command, values)
      }
    })
  }
}
