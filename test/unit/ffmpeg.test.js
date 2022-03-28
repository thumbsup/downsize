const should = require('should/as-function')
const childProcess = require('child_process')
const ffmpeg = require('../../lib/video/ffmpeg')
const mockSpawn = require('mock-spawn')
const sinon = require('sinon')

describe('ffmpeg', () => {
  beforeEach(() => {
    sinon.stub(childProcess, 'spawn')
  })

  afterEach(() => {
    childProcess.spawn.restore()
  })

  it('calls the callback when ffmpeg exits with code 0', done => {
    const spawn = mockSpawn()
    childProcess.spawn.callsFake(spawn)
    spawn.setDefault(spawn.simple(0))
    ffmpeg.exec(['--fake'], err => {
      should(err).eql(null)
      done()
    })
  })

  it('calls the callback with an error when ffmpeg exits with code 1', done => {
    const spawn = mockSpawn()
    childProcess.spawn.callsFake(spawn)
    spawn.setDefault(spawn.simple(1))
    ffmpeg.exec(['--fake'], err => {
      should(err.message).eql('ffmpeg exited with code 1')
      done()
    })
  })

  it('calls the callback when ffmpeg cannot be launched', done => {
    const spawn = mockSpawn()
    childProcess.spawn.callsFake(spawn)
    spawn.setDefault(function (cb) {
      this.emit('error', new Error('spawn ENOENT'))
    })
    ffmpeg.exec(['--fake'], err => {
      should(err.message).eql('spawn ENOENT')
      done()
    })
  })

  it('reports progress when ffmpeg emits a duration update', done => {
    const spawn = mockSpawn()
    childProcess.spawn.callsFake(spawn)
    spawn.setDefault(function () {
      this.stderr.write('Duration: 00:00:20.00\n')
      this.stderr.write('frame=1000 fps=100 q=10.0 size=1000kB time=00:00:10.00 bitrate=100.0kbits/s speed=1.00x\n')
    })
    const progress = ffmpeg.exec(['--fake'])
    progress.on('progress', percent => {
      should(percent).eql(50)
      done()
    })
  })

  it('can parse duration and progress even when lines are emitted in chunks', done => {
    const spawn = mockSpawn()
    childProcess.spawn.callsFake(spawn)
    spawn.setDefault(function () {
      this.stderr.write('Duration: 00:')
      this.stderr.write('00:20.00\n')
      this.stderr.write('frame=1000 fps=100 q=10.0 size=1000kB time=00:00:')
      this.stderr.write('10.00 bitrate=100.0kbits/s speed=1.00x\n')
    })
    const progress = ffmpeg.exec(['--fake'])
    progress.on('progress', percent => {
      should(percent).eql(50)
      done()
    })
  })

  it('reports progress even when duration and time are emitted together', done => {
    const spawn = mockSpawn()
    childProcess.spawn.callsFake(spawn)
    spawn.setDefault(function () {
      this.stderr.write(
        'Duration: 00:00:20.00\n' +
        'frame=1000 fps=100 q=10.0 size=1000kB time=00:00:10.00 bitrate=100.0kbits/s speed=1.00x\n'
      )
    })
    const progress = ffmpeg.exec(['--fake'])
    progress.on('progress', percent => {
      should(percent).eql(50)
      done()
    })
  })

  it('reports progress throughout and finally terminates', done => {
    const percents = []
    const spawn = mockSpawn()
    childProcess.spawn.callsFake(spawn)
    spawn.setDefault(function (callback) {
      this.stderr.write('Duration: 00:00:40.00\n')
      this.stderr.write('frame=0000 fps=100 q=10.0 size=1000kB time=00:00:10.00 bitrate=100.0kbits/s speed=1.00x\n')
      this.stderr.write('frame=1000 fps=100 q=10.0 size=1000kB time=00:00:20.00 bitrate=100.0kbits/s speed=1.00x\n')
      this.stderr.write('frame=2000 fps=100 q=10.0 size=1000kB time=00:00:30.00 bitrate=100.0kbits/s speed=1.00x\n')
      this.stderr.write('frame=2000 fps=100 q=10.0 size=1000kB time=00:00:40.00 bitrate=100.0kbits/s speed=1.00x\n')
      callback(0) // eslint-disable-line node/no-callback-literal
    })
    const progress = ffmpeg.exec(['--fake'], err => {
      should(err).eql(null)
      should(percents).eql([25, 50, 75, 100])
      done()
    })
    progress.on('progress', percent => percents.push(percent))
  })
})
