const childProcess = require('node:child_process')
const should = require('should/as-function')
const sinon = require('sinon')
const ffprobe = require('../../lib/video/ffprobe')

afterEach(() => {
  sinon.restore()
})

describe('ffprobe', () => {
  it('parses the FFProbe output rounded to 1 digit', done => {
    sinon.stub(childProcess, 'execFile').yields(undefined, '12.3456')
    ffprobe.getDuration('video.mp4', (err, duration) => {
      should(err).eql(null)
      should(duration).eql(12.3)
      done()
    })
  })

  it('fail if FFProbe cannot be executed', done => {
    sinon.stub(childProcess, 'execFile').yields(new Error('Not found'))
    ffprobe.getDuration('video.mp4', (err, duration) => {
      should(err).be.instanceOf(Error)
      done()
    })
  })

  it('handles unexpected FFProbe output', done => {
    sinon.stub(childProcess, 'execFile').yields(undefined, 'unexpected')
    ffprobe.getDuration('video.mp4', (err, duration) => {
      should(err).be.instanceOf(Error)
      done()
    })
  })
})
