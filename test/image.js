const diff = require('./diff')
const tape = require('tape')

tape('crops a JPEG file', (test) => {
  diff.image(test, {
    input: 'images/desk.jpg',
    expect: 'images/desk.thumb.jpg',
    options: { height: 100, width: 100 }
  })
})

tape('resizes a JPEG file proportionally', (test) => {
  diff.image(test, {
    input: 'images/desk.jpg',
    expect: 'images/desk.large.jpg',
    options: { height: 150 }
  })
})

tape('can set a custom output quality', (test) => {
  diff.image(test, {
    input: 'images/desk.jpg',
    expect: 'images/desk.low.jpg',
    options: { height: 100, quality: 30 }
  })
})

tape('crops a non-animated GIF', (test) => {
  diff.image(test, {
    input: 'images/countdown-frame.gif',
    expect: 'images/countdown-frame.thumb.gif',
    options: { height: 100, width: 100 }
  })
})

tape('resizes a non-animated GIF proportionally', (test) => {
  diff.image(test, {
    input: 'images/countdown-frame.gif',
    expect: 'images/countdown-frame.large.gif',
    options: { height: 150 }
  })
})

tape('crops a transparent GIF', (test) => {
  diff.image(test, {
    input: 'images/nyan-frame.gif',
    expect: 'images/nyan-frame.thumb.gif',
    options: { height: 100, width: 100 }
  })
})

tape('resizes a transparent GIF', (test) => {
  diff.image(test, {
    input: 'images/nyan-frame.gif',
    expect: 'images/nyan-frame.large.gif',
    options: { height: 150 }
  })
})

// should be a single frame, a cropped animation wouldn't make much sense
// currently an issue, the thumbnail is all weird
tape.skip('crops an animated GIF to a single frame', (test) => {
  diff.image(test, {
    input: 'images/nyan.gif',
    expect: 'images/nyan.thumb.gif',
    options: { height: 100, width: 100 }
  })
})

tape('converts a TIFF to JPEG', (test) => {
  diff.image(test, {
    input: 'images/desk.tiff',
    expect: 'images/desk.jpg',
    options: {}
  })
})

tape('can add a watermark in the default location', (test) => {
  diff.image(test, {
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-default.jpg',
    options: {
      watermark: {
        file: 'test-data/input/images/watermark.png'
      }
    }
  })
})

tape('can add a watermark in a given location', (test) => {
  diff.image(test, {
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-gravity.jpg',
    options: {
      watermark: {
        file: 'test-data/input/images/watermark.png',
        gravity: 'NorthEast'
      }
    }
  })
})

tape('can add a tiled watermark', (test) => {
  diff.image(test, {
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-tiled.jpg',
    options: {
      watermark: {
        file: 'test-data/input/images/watermark.png',
        tile: true
      }
    }
  })
})

tape('includes the watermark when resizing', (test) => {
  diff.image(test, {
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-resize.jpg',
    options: {
      height: 200,
      watermark: {
        file: 'test-data/input/images/watermark.png'
      }
    }
  })
})

tape('ignores the watermark when cropping', (test) => {
  diff.image(test, {
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-crop.jpg',
    options: {
      height: 100,
      width: 100,
      watermark: {
        file: 'test-data/input/images/watermark.png'
      }
    }
  })
})

tape('can add custom post-processing arguments', (test) => {
  diff.image(test, {
    input: 'images/desk.jpg',
    expect: 'images/desk.processed.jpg',
    options: {
      args: ['-equalize', '-modulate 120']
    }
  })
})

const ORIENTATIONS = [1, 2, 3, 4, 5, 6, 7, 8]

ORIENTATIONS.forEach((orientation) => {
  tape(`reads rotation data (landscape ${orientation}) and generates a straight-up image`, (test) => {
    diff.image(test, {
      input: `rotations/landscape_${orientation}.jpg`,
      expect: `rotations/landscape_${orientation}.jpg`,
      options: { height: 150 }
    })
  })
})

ORIENTATIONS.forEach((orientation) => {
  tape(`reads rotation data (portrait ${orientation}) and generates a straight-up image`, (test) => {
    diff.image(test, {
      input: `rotations/portrait_${orientation}.jpg`,
      expect: `rotations/portrait_${orientation}.jpg`,
      options: { width: 150 }
    })
  })
})
