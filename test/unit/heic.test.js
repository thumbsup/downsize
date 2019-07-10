const childProcess = require('child_process')
const async = require('async')
const sinon = require('sinon')
const heic = require('../../lib/image/heic')

afterEach(() => {
  sinon.restore()
})

test('calls gmagick and exiftool', done => {
  sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
  heic.convert('input1.heic', 'output.jpg', err => {
    expect(err).toEqual(null)
    expect(childProcess.execFile.callCount).toEqual(3)
    expect(childProcess.execFile.getCall(0).args[0]).toEqual('magick')
    expect(childProcess.execFile.getCall(1).args[0]).toEqual('exiftool')
    expect(childProcess.execFile.getCall(2).args[0]).toEqual('magick')
    done()
  })
})

test('stops at the first failing call', done => {
  sinon.stub(childProcess, 'execFile').callsFake(fakeExecFileFail)
  heic.convert('input2.heic', 'output.jpg', err => {
    expect(err.message).toEqual('FAIL')
    expect(childProcess.execFile.callCount).toEqual(1)
    expect(childProcess.execFile.getCall(0).args[0]).toEqual('magick')
    done()
  })
})

test('only processes each file once', done => {
  sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
  async.parallel([
    done => heic.convert('input3.heic', 'output.jpg', done),
    done => heic.convert('input3.heic', 'output.jpg', done)
  ]).then(res => {
    expect(childProcess.execFile.callCount).toEqual(3)
    done()
  })
})

test('keeps track of files already processed', done => {
  sinon.stub(childProcess, 'execFile').callsFake(fakeExecFile)
  async.parallel([
    done => heic.convert('input4.heic', 'output.jpg', done),
    done => heic.convert('input5.heic', 'output.jpg', done),
    done => heic.convert('input6.heic', 'output.jpg', done),
    done => heic.convert('input4.heic', 'output.jpg', done)
  ]).then(res => {
    expect(childProcess.execFile.callCount).toEqual(3 * 3)
    done()
  })
})

function fakeExecFile (cmd, args, done) {
  setTimeout(done, 50)
}

function fakeExecFileFail (cmd, args, done) {
  setTimeout(() => done(new Error('FAIL')), 50)
}
