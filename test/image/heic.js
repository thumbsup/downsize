const childProcess = require('child_process')
const async = require('async')
const sinon = require('sinon')
const redtape = require('redtape')
const heic = require('../../lib/image/heic')

const tape = redtape({
  afterEach: function (cb) {
    sinon.restore()
    cb()
  }
})

tape('calls gmagick and exiftool', t => {
  sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
  heic.convert('input1.heic', 'output.jpg', err => {
    t.equal(err, null)
    t.equal(childProcess.execFile.callCount, 3)
    t.equal(childProcess.execFile.getCall(0).args[0], 'magick')
    t.equal(childProcess.execFile.getCall(1).args[0], 'exiftool')
    t.equal(childProcess.execFile.getCall(2).args[0], 'magick')
    t.end()
  })
})

tape('stops at the first failing call', t => {
  sinon.stub(childProcess, 'execFile').callsFake(fakeExecFileFail)
  heic.convert('input2.heic', 'output.jpg', err => {
    t.equal(err.message, 'FAIL')
    t.equal(childProcess.execFile.callCount, 1)
    t.equal(childProcess.execFile.getCall(0).args[0], 'magick')
    t.end()
  })
})

tape('only processes each file once', t => {
  sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
  async.parallel([
    done => heic.convert('input3.heic', 'output.jpg', done),
    done => heic.convert('input3.heic', 'output.jpg', done)
  ]).then(res => {
    t.equal(childProcess.execFile.callCount, 3)
    t.end()
  })
})

tape('keeps track of files already processed', t => {
  sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
  async.parallel([
    done => heic.convert('input4.heic', 'output.jpg', done),
    done => heic.convert('input5.heic', 'output.jpg', done),
    done => heic.convert('input6.heic', 'output.jpg', done),
    done => heic.convert('input4.heic', 'output.jpg', done)
  ]).then(res => {
    t.equal(childProcess.execFile.callCount, 3 * 3)
    t.end()
  })
})

function fakeExecFile (cmd, args, done) {
  setTimeout(done, 50)
}

function fakeExecFileFail (cmd, args, done) {
  setTimeout(() => done(new Error('FAIL')), 50)
}
