const sinon = require('sinon')
const childProcess = require('child_process')
const ffprobe = require('../../lib/video/ffprobe')

afterEach(() => {
  sinon.restore()
})

test('parses the FFProbe output rounded to 1 digit', done => {
  sinon.stub(childProcess, 'exec').yields(undefined, '12.3456')
  ffprobe.getDuration('video.mp4', (err, duration) => {
    expect(err).toBe(null)
    expect(duration).toBe(12.3)
    done()
  })
})

test('fail if FFProbe cannot be executed', done => {
  sinon.stub(childProcess, 'exec').yields(new Error('Not found'))
  ffprobe.getDuration('video.mp4', (err, duration) => {
    expect(err).toBeInstanceOf(Error)
    done()
  })
})

test('handles unexpected FFProbe output', done => {
  sinon.stub(childProcess, 'exec').yields(undefined, 'unexpected')
  ffprobe.getDuration('video.mp4', (err, duration) => {
    expect(err).toBeInstanceOf(Error)
    done()
  })
})
