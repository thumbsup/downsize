/*
  Applies an array of GraphicsMagick string arguments to a <gm> instance
  e.g. apply(image, ['--modulate 120'])
*/
exports.apply = function (image, args) {
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
