const childProcess = require('child_process')
const ffmpeg = require('../../lib/video/ffmpeg')
const mockSpawn = require('mock-spawn')
const sinon = require('sinon')

const spawn = mockSpawn()

beforeEach(() => {
  sinon.stub(childProcess, 'spawn').callsFake(spawn)
})

afterEach(() => {
  childProcess.spawn.restore()
})

test('calls the callback when ffmpeg exits with code 0', done => {
  spawn.setStrategy(cmd => spawn.simple(0))
  ffmpeg.exec(['--fake'], err => {
    expect(err).toEqual(null)
    done()
  })
})

test('calls the callback with an error when ffmpeg exits with code 1', done => {
  spawn.setStrategy(cmd => spawn.simple(1))
  ffmpeg.exec(['--fake'], err => {
    expect(err.message).toEqual('ffmpeg exited with code 1')
    done()
  })
})

test('reports progress when ffmpeg emits a duration update', done => {
  spawn.setStrategy(cmd => {
    return function () {
      this.stderr.write('Duration: 00:00:20.00\n')
      this.stderr.write('frame=1000 fps=100 q=10.0 size=1000kB time=00:00:10.00 bitrate=100.0kbits/s speed=1.00x\n')
    }
  })
  const progress = ffmpeg.exec(['--fake'])
  progress.on('progress', percent => {
    expect(percent).toEqual(50)
    done()
  })
})

test('can parse duration and progress even when lines are emitted in chunks', done => {
  spawn.setStrategy(cmd => {
    return function () {
      this.stderr.write('Duration: 00:')
      this.stderr.write('00:20.00\n')
      this.stderr.write('frame=1000 fps=100 q=10.0 size=1000kB time=00:00:')
      this.stderr.write('10.00 bitrate=100.0kbits/s speed=1.00x\n')
    }
  })
  const progress = ffmpeg.exec(['--fake'])
  progress.on('progress', percent => {
    expect(percent).toEqual(50)
    done()
  })
})

test('reports progress even when duration and time are emitted together', done => {
  spawn.setStrategy(cmd => {
    return function () {
      this.stderr.write(
        'Duration: 00:00:20.00\n' +
        'frame=1000 fps=100 q=10.0 size=1000kB time=00:00:10.00 bitrate=100.0kbits/s speed=1.00x\n'
      )
    }
  })
  const progress = ffmpeg.exec(['--fake'])
  progress.on('progress', percent => {
    expect(percent).toEqual(50)
    done()
  })
})

test('reports progress throughout and finally terminates', done => {
  const percents = []
  spawn.setStrategy(cmd => {
    return function (callback) {
      this.stderr.write('Duration: 00:00:40.00\n')
      this.stderr.write('frame=0000 fps=100 q=10.0 size=1000kB time=00:00:10.00 bitrate=100.0kbits/s speed=1.00x\n')
      this.stderr.write('frame=1000 fps=100 q=10.0 size=1000kB time=00:00:20.00 bitrate=100.0kbits/s speed=1.00x\n')
      this.stderr.write('frame=2000 fps=100 q=10.0 size=1000kB time=00:00:30.00 bitrate=100.0kbits/s speed=1.00x\n')
      this.stderr.write('frame=2000 fps=100 q=10.0 size=1000kB time=00:00:40.00 bitrate=100.0kbits/s speed=1.00x\n')
      callback(0) // eslint-disable-line standard/no-callback-literal
    }
  })
  const progress = ffmpeg.exec(['--fake'], err => {
    expect(err).toEqual(null)
    expect(percents).toEqual([25, 50, 75, 100])
    done()
  })
  progress.on('progress', percent => percents.push(percent))
})
