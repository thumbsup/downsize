const should = require('should/as-function')
const ffprobe = require('../../lib/video/ffprobe')

describe('ffprobe', () => {
  it('reads the duration of a video', done => {
    const name = 'test-data/input/videos/big_buck_bunny.mp4'
    ffprobe.getDuration(name, (err, duration) => {
      should(err).eql(null)
      should(duration).eql(15.4)
      done()
    })
  })

  it('does not take the frame count into account', done => {
    const name = 'test-data/input/videos/single-frame.mov'
    ffprobe.getDuration(name, (err, duration) => {
      should(err).eql(null)
      should(duration).eql(10)
      done()
    })
  })
})
