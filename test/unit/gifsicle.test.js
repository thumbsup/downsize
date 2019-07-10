const childProcess = require('child_process')
const sinon = require('sinon')
const gifsicle = require('../../lib/image/gifsicle')

beforeEach(() => {
  sinon.stub(childProcess, 'execFile').yields()
})

afterEach(() => {
  childProcess.execFile.restore()
})

test('throws if the image is not a GIF', done => {
  expect(() => {
    gifsicle.createAnimatedGif('source.gif', 'target.jpg', {}, () => {})
  }).toThrowError(/extension/)
  done()
})

test('cannot crop an animated GIF', done => {
  const opts = { height: 100, width: 100 }
  expect(() => {
    gifsicle.createAnimatedGif('source.gif', 'target.gif', opts, () => {})
  }).toThrowError(/crop/)
  done()
})

test('calls Gifsicle', done => {
  const opts = { width: 100 }
  gifsicle.createAnimatedGif('source.gif', 'target.gif', opts, err => {
    expect(err).toBeUndefined()
    expect(childProcess.execFile.callCount).toEqual(1)
    const call = childProcess.execFile.args[0]
    const program = call[0]
    const args = call[1].join(' ')
    expect(program).toEqual('gifsicle')
    expect(args).toMatch('-o target.gif source.gif')
    done()
  })
})

test('resizes to a given width', done => {
  const opts = { width: 100 }
  gifsicle.createAnimatedGif('source.gif', 'target.gif', opts, err => {
    expect(err).toBeUndefined()
    expect(childProcess.execFile.callCount).toEqual(1)
    const call = childProcess.execFile.args[0]
    const args = call[1].join(' ')
    expect(args).toMatch('--resize-fit 100x_')
    done()
  })
})

test('resizes to a given height', done => {
  const opts = { height: 100 }
  gifsicle.createAnimatedGif('source.gif', 'target.gif', opts, err => {
    expect(err).toBeUndefined()
    expect(childProcess.execFile.callCount).toEqual(1)
    const call = childProcess.execFile.args[0]
    const args = call[1].join(' ')
    expect(args).toMatch('--resize-fit _x100')
    done()
  })
})
