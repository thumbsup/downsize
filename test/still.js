const convert = require('../lib/index')
const diff = require('./diff')
const tape = require('tape')

tape('extracts a frame from an MP4 video', (test) => {
  diff.still(test, {
    input: 'videos/countdown.mp4',
    expect: 'videos/countdown.mp4.jpg',
    options: { height: 100, width: 100 }
  })
})
