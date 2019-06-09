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

tape('create a cropped frame from an animated GIF', (test) => {
  diff.image(test, {
    input: 'images/simpsons.gif',
    expect: 'images/simpsons.cropped.gif',
    options: {
      height: 150,
      width: 150
    }
  })
})

tape('creates a resized frame from an animated GIF', (test) => {
  diff.image(test, {
    input: 'images/simpsons.gif',
    expect: 'images/simpsons.resized.gif',
    options: {
      height: 150
    }
  })
})

tape('creates a resized animated GIF', (test) => {
  diff.image(test, {
    input: 'images/simpsons.gif',
    expect: 'images/simpsons.anim.gif',
    options: {
      height: 150,
      animated: true
    }
  })
})

tape('extract a frame from a transparent animated GIF', (test) => {
  diff.image(test, {
    input: 'images/toad.gif',
    expect: 'images/toad.frame.gif',
    options: { height: 100 }
  })
})

tape('resizes a transparent animated GIF', (test) => {
  diff.image(test, {
    input: 'images/toad.gif',
    expect: 'images/toad.gif',
    options: { height: 100, animated: true }
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
        position: 'NorthEast'
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
        position: 'Repeat'
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

tape('can process a single-image HEIC file', (test) => {
  diff.image(test, {
    input: 'images/heic-single.heic',
    expect: 'images/heic-single.jpg',
    options: {
      height: 300
    }
  })
})

tape('can process a burst-image HEIC file', (test) => {
  diff.image(test, {
    input: 'images/heic-burst.heic',
    expect: 'images/heic-burst.jpg',
    options: {
      height: 300
    }
  })
})

tape('can process a live (photo + video) HEIC file', (test) => {
  diff.image(test, {
    input: 'images/heic-live.heic',
    expect: 'images/heic-live.jpg',
    options: {
      height: 300
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
