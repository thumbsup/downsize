const should = require('should/as-function')
const childProcess = require('child_process')
const async = require('async')
const sinon = require('sinon')
const heic = require('../../lib/image/heic')

afterEach(() => {
  sinon.restore()
})

describe('heic', () => {
  it('calls gmagick and exiftool', done => {
    sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
    heic.convert('input1.heic', err => {
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
    heic.convert('input2.heic', err => {
      should(err.message).eql('FAIL')
      should(childProcess.execFile.callCount).eql(1)
      should(childProcess.execFile.getCall(0).args[0]).eql('magick')
      done()
    })
  })

  it('only processes each file once', done => {
    sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
    async.parallel([
      done => heic.convert('input3.heic', done),
      done => heic.convert('input3.heic', done)
    ]).then(res => {
      should(childProcess.execFile.callCount).eql(3)
      done()
    })
  })

  it('keeps track of files already processed', done => {
    sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
    async.parallel([
      done => heic.convert('input4.heic', done),
      done => heic.convert('input5.heic', done),
      done => heic.convert('input6.heic', done),
      done => heic.convert('input4.heic', done)
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
