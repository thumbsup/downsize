const diff = require('./diff')

test('crops a JPEG file', done => {
  diff.image({
    input: 'images/desk.jpg',
    expect: 'images/desk.thumb.jpg',
    options: { height: 100, width: 100 }
  }, done)
})

test('resizes a JPEG file proportionally', done => {
  diff.image({
    input: 'images/desk.jpg',
    expect: 'images/desk.large.jpg',
    options: { height: 150 }
  }, done)
})

test('can set a custom output quality', done => {
  diff.image({
    input: 'images/desk.jpg',
    expect: 'images/desk.low.jpg',
    options: { height: 100, quality: 30 }
  }, done)
})

test('create a cropped frame from an animated GIF', done => {
  diff.image({
    input: 'images/simpsons.gif',
    expect: 'images/simpsons.cropped.gif',
    options: {
      height: 150,
      width: 150
    }
  }, done)
})

test('creates a resized frame from an animated GIF', done => {
  diff.image({
    input: 'images/simpsons.gif',
    expect: 'images/simpsons.resized.gif',
    options: {
      height: 150
    }
  }, done)
})

test('creates a resized animated GIF', done => {
  diff.image({
    input: 'images/simpsons.gif',
    expect: 'images/simpsons.anim.gif',
    options: {
      height: 150,
      animated: true
    }
  }, done)
})

test('extract a frame from a transparent animated GIF', done => {
  diff.image({
    input: 'images/toad.gif',
    expect: 'images/toad.frame.gif',
    options: { height: 100 }
  }, done)
})

test('resizes a transparent animated GIF', done => {
  diff.image({
    input: 'images/toad.gif',
    expect: 'images/toad.gif',
    options: { height: 100, animated: true }
  }, done)
})

test('converts a TIFF to JPEG', done => {
  diff.image({
    input: 'images/desk.tiff',
    expect: 'images/desk.jpg',
    options: {}
  }, done)
})

test('can add a watermark in the default location', done => {
  diff.image({
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-default.jpg',
    options: {
      watermark: {
        file: 'test-data/input/images/watermark.png'
      }
    }
  }, done)
})

test('can add a watermark in a given location', done => {
  diff.image({
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-gravity.jpg',
    options: {
      watermark: {
        file: 'test-data/input/images/watermark.png',
        position: 'NorthEast'
      }
    }
  }, done)
})

test('can add a tiled watermark', done => {
  diff.image({
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-tiled.jpg',
    options: {
      watermark: {
        file: 'test-data/input/images/watermark.png',
        position: 'Repeat'
      }
    }
  }, done)
})

test('includes the watermark when resizing', done => {
  diff.image({
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-resize.jpg',
    options: {
      height: 200,
      watermark: {
        file: 'test-data/input/images/watermark.png'
      }
    }
  }, done)
})

test('ignores the watermark when cropping', done => {
  diff.image({
    input: 'images/bike.jpg',
    expect: 'images/bike-wm-crop.jpg',
    options: {
      height: 100,
      width: 100,
      watermark: {
        file: 'test-data/input/images/watermark.png'
      }
    }
  }, done)
})

test('can add custom post-processing arguments', done => {
  diff.image({
    input: 'images/desk.jpg',
    expect: 'images/desk.processed.jpg',
    options: {
      args: ['-equalize', '-modulate 120']
    }
  }, done)
})

test('can process a single-image HEIC file', done => {
  diff.image({
    input: 'images/heic-single.heic',
    expect: 'images/heic-single.jpg',
    options: {
      height: 300
    }
  }, done)
})

test('can process a burst-image HEIC file', done => {
  diff.image({
    input: 'images/heic-burst.heic',
    expect: 'images/heic-burst.jpg',
    options: {
      height: 300
    }
  }, done)
})

test('can process a live (photo + video) HEIC file', done => {
  diff.image({
    input: 'images/heic-live.heic',
    expect: 'images/heic-live.jpg',
    options: {
      height: 300
    }
  }, done)
})

test('can process a HEIC with a P3 color profile', done => {
  diff.image({
    input: 'images/heic-color-profile.heic',
    expect: 'images/heic-color-profile.jpg',
    options: {
      height: 300
    }
  }, done)
}, 10000)

const ORIENTATIONS = [1, 2, 3, 4, 5, 6, 7, 8]

ORIENTATIONS.forEach((orientation) => {
  test(`reads rotation data (landscape ${orientation}) and generates a straight-up image`, done => {
    diff.image({
      input: `rotations/landscape_${orientation}.jpg`,
      expect: `rotations/landscape_${orientation}.jpg`,
      options: { height: 150 }
    }, done)
  })
})

ORIENTATIONS.forEach((orientation) => {
  test(`reads rotation data (portrait ${orientation}) and generates a straight-up image`, done => {
    diff.image({
      input: `rotations/portrait_${orientation}.jpg`,
      expect: `rotations/portrait_${orientation}.jpg`,
      options: { width: 150 }
    }, done)
  })
})
