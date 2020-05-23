const ffprobe = require('../../lib/video/ffprobe')

test('reads the duration of a video', done => {
  const name = 'test-data/input/videos/big_buck_bunny.mp4'
  ffprobe.getDuration(name, (err, duration) => {
    expect(err).toEqual(null)
    expect(duration).toBe(15.4)
    done()
  })
})

test('does not take the frame count into account', done => {
  const name = 'test-data/input/videos/single-frame.mov'
  ffprobe.getDuration(name, (err, duration) => {
    expect(err).toEqual(null)
    expect(duration).toBe(10)
    done()
  })
})
