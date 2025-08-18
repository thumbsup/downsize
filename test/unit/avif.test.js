const childProcess = require('node:child_process')
const should = require('should/as-function')
const async = require('async')
const sinon = require('sinon')
const avif = require('../../lib/image/avif')

afterEach(() => {
  sinon.restore()
})

describe('avif', () => {
  it('calls gmagick and exiftool', done => {
    sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
    avif.convert('input1.avif', err => {
      should(err).eql(null)
      should(childProcess.execFile.callCount).eql(3)
      should(childProcess.execFile.getCall(0).args[0]).eql('magick')
      should(childProcess.execFile.getCall(1).args[0]).eql('exiftool')
      should(childProcess.execFile.getCall(2).args[0]).eql('magick')
      done()
    })
  })

  it('stops at the first failing call', done => {
    sinon.stub(childProcess, 'execFile').callsFake(fakeExecFileFail)
    avif.convert('input2.avif', err => {
      should(err.message).eql('FAIL')
      should(childProcess.execFile.callCount).eql(1)
      should(childProcess.execFile.getCall(0).args[0]).eql('magick')
      done()
    })
  })

  it('only processes each file once', done => {
    sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
    async.parallel([
      done => avif.convert('input3.avif', done),
      done => avif.convert('input3.avif', done)
    ]).then(res => {
      should(childProcess.execFile.callCount).eql(3)
      done()
    })
  })

  it('keeps track of files already processed', done => {
    sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
    async.parallel([
      done => avif.convert('input4.avif', done),
      done => avif.convert('input5.avif', done),
      done => avif.convert('input6.avif', done),
      done => avif.convert('input4.avif', done)
    ]).then(res => {
      should(childProcess.execFile.callCount).eql(3 * 3)
      done()
    })
  })
})

function fakeExecFile (cmd, args, done) {
  setTimeout(done, 50)
}

function fakeExecFileFail (cmd, args, done) {
  setTimeout(() => done(new Error('FAIL')), 50)
}
