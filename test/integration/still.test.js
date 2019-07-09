const diff = require('./diff')

test('extracts a frame from an MP4 video', done => {
  diff.still({
    input: 'videos/countdown.mp4',
    expect: 'videos/countdown-poster.mp4.jpg',
    options: { height: 150 }
  }, done)
})

test('extracts a frame from a very short video', done => {
  diff.still({
    input: 'videos/short.mp4',
    expect: 'videos/short.jpg',
    options: { height: 150 }
  }, done)
})

test('extracts a frame from a video that only has a single frame', done => {
  diff.still({
    input: 'videos/single-frame.mov',
    expect: 'videos/single-frame.jpg',
    options: { height: 150 }
  }, done)
})

test('extracts and crops a frame from an MP4 video', done => {
  diff.still({
    input: 'videos/countdown.mp4',
    expect: 'videos/countdown-thumb.mp4.jpg',
    options: { height: 100, width: 100 }
  }, done)
})
