const diff = require('./diff')
const tape = require('tape')

tape('extracts a frame from an MP4 video', (test) => {
  diff.still(test, {
    input: 'videos/countdown.mp4',
    expect: 'videos/countdown-poster.mp4.jpg',
    options: { width: 150 }
  })
})

tape('extracts a frame from a very short video', (test) => {
  diff.still(test, {
    input: 'videos/short.mp4',
    expect: 'videos/short.jpg',
    options: { width: 150 }
  })
})

tape('extracts and crops a frame from an MP4 video', (test) => {
  diff.still(test, {
    input: 'videos/countdown.mp4',
    expect: 'videos/countdown-thumb.mp4.jpg',
    options: { height: 100, width: 100 }
  })
})
