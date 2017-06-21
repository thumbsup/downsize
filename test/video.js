const diff = require('./diff')
const tape = require('tape')

tape('can downsample a video for a smaller filesize', (test) => {
  diff.video(test, {
    input: 'videos/countdown.mp4',
    expect: 'videos/countdown-small.mp4',
    options: {}
  })
})
