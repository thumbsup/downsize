const should = require('should/as-function')
const childProcess = require('child_process')
const sinon = require('sinon')
const gifsicle = require('../../lib/image/gifsicle')

describe('gifsicle', () => {
  beforeEach(() => {
    sinon.stub(childProcess, 'execFile').yields()
  })

  afterEach(() => {
    childProcess.execFile.restore()
  })

  it('throws if the image is not a GIF', done => {
    should(() => {
      gifsicle.createAnimatedGif('source.gif', 'target.jpg', {}, () => {})
    }).throw(/extension/)
    done()
  })

  it('cannot crop an animated GIF', done => {
    const opts = { height: 100, width: 100 }
    should(() => {
      gifsicle.createAnimatedGif('source.gif', 'target.gif', opts, () => {})
    }).throw(/crop/)
    done()
  })

  it('calls Gifsicle', done => {
    const opts = { width: 100 }
    gifsicle.createAnimatedGif('source.gif', 'target.gif', opts, err => {
      should(err).eql(undefined)
      should(childProcess.execFile.callCount).eql(1)
      const call = childProcess.execFile.args[0]
      const program = call[0]
      const args = call[1].join(' ')
      should(program).eql('gifsicle')
      should(args).match(/-o target\.gif source\.gif/)
      done()
    })
  })

  it('resizes to a given width', done => {
    const opts = { width: 100 }
    gifsicle.createAnimatedGif('source.gif', 'target.gif', opts, err => {
      should(err).eql(undefined)
      should(childProcess.execFile.callCount).eql(1)
      const call = childProcess.execFile.args[0]
      const args = call[1].join(' ')
      should(args).match(/--resize-fit 100x_/)
      done()
    })
  })

  it('resizes to a given height', done => {
    const opts = { height: 100 }
    gifsicle.createAnimatedGif('source.gif', 'target.gif', opts, err => {
      should(err).eql(undefined)
      should(childProcess.execFile.callCount).eql(1)
      const call = childProcess.execFile.args[0]
      const args = call[1].join(' ')
      should(args).match(/--resize-fit _x100/)
      done()
    })
  })
})
