const assert = require('assert')
const tape = require('tape')
const childProcess = require('child_process')
const ffmpeg = require('../../lib/video/ffmpeg')
const mockSpawn = require('mock-spawn')
const sinon = require('sinon')

const spawn = mockSpawn()
tape('setup', t => {
  sinon.stub(childProcess, 'spawn').callsFake(spawn)
  t.end()
})

tape('calls the callback when ffmpeg exits with code 0', (t) => {
  spawn.setStrategy(cmd => spawn.simple(0))
  ffmpeg.exec(['--fake'], err => {
    assert.equal(err, null)
    t.end()
  })
})

tape('calls the callback with an error when ffmpeg exits with code 1', (t) => {
  spawn.setStrategy(cmd => spawn.simple(1))
  ffmpeg.exec(['--fake'], err => {
    assert.equal(err.message, 'ffmpeg exited with code 1')
    t.end()
  })
})

tape('reports progress when ffmpeg emits a duration update', (t) => {
  spawn.setStrategy(cmd => {
    return function (done) {
      this.stderr.write('Duration: 00:00:20.00\n')
      this.stderr.write('frame=1000 fps=100 q=10.0 size=1000kB time=00:00:10.00 bitrate=100.0kbits/s speed=1.00x\n')
    }
  })
  const progress = ffmpeg.exec(['--fake'])
  progress.on('progress', percent => {
    assert.equal(percent, 50)
    t.end()
  })
})

tape('can parse duration and progress even when lines are emitted in chunks', (t) => {
  spawn.setStrategy(cmd => {
    return function (done) {
      this.stderr.write('Duration: 00:')
      this.stderr.write('00:20.00\n')
      this.stderr.write('frame=1000 fps=100 q=10.0 size=1000kB time=00:00:')
      this.stderr.write('10.00 bitrate=100.0kbits/s speed=1.00x\n')
    }
  })
  const progress = ffmpeg.exec(['--fake'])
  progress.on('progress', percent => {
    assert.equal(percent, 50)
    t.end()
  })
})

tape('reports progress even when duration and time are emitted together', (t) => {
  spawn.setStrategy(cmd => {
    return function (done) {
      this.stderr.write(
        'Duration: 00:00:20.00\n' +
        'frame=1000 fps=100 q=10.0 size=1000kB time=00:00:10.00 bitrate=100.0kbits/s speed=1.00x\n'
      )
    }
  })
  const progress = ffmpeg.exec(['--fake'])
  progress.on('progress', percent => {
    assert.equal(percent, 50)
    t.end()
  })
})

tape('reports progress throughout and finally terminates', (t) => {
  const percents = []
  spawn.setStrategy(cmd => {
    return function (done) {
      this.stderr.write('Duration: 00:00:40.00\n')
      this.stderr.write('frame=0000 fps=100 q=10.0 size=1000kB time=00:00:10.00 bitrate=100.0kbits/s speed=1.00x\n')
      this.stderr.write('frame=1000 fps=100 q=10.0 size=1000kB time=00:00:20.00 bitrate=100.0kbits/s speed=1.00x\n')
      this.stderr.write('frame=2000 fps=100 q=10.0 size=1000kB time=00:00:30.00 bitrate=100.0kbits/s speed=1.00x\n')
      this.stderr.write('frame=2000 fps=100 q=10.0 size=1000kB time=00:00:40.00 bitrate=100.0kbits/s speed=1.00x\n')
      done(0)
    }
  })
  const progress = ffmpeg.exec(['--fake'], err => {
    assert.equal(err, null)
    assert.deepEqual(percents, [25, 50, 75, 100])
    t.end()
  })
  progress.on('progress', percent => percents.push(percent))
})

tape('teardown', t => {
  childProcess.spawn.restore()
  t.end()
})
