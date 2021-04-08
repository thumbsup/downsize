const should = require('should/as-function')
const gmagick = require('../../lib/image/gmagick')
const sinon = require('sinon')

function gm () {
  return {
    out: sinon.stub()
  }
}

describe('gmagick', () => {
  it('no arguments', () => {
    const image = gm()
    gmagick.addRawArgs(image, undefined)
    should(image.out.callCount).eql(0)
  })

  it('empty array of arguments', () => {
    const image = gm()
    gmagick.addRawArgs(image, [])
    should(image.out.callCount).eql(0)
  })

  it('single argument with no values', () => {
    const image = gm()
    gmagick.addRawArgs(image, ['-equalize'])
    should(image.out.callCount).eql(1)
    should(image.out.args[0]).eql(['-equalize'])
  })

  it('single argument with one value', () => {
    const image = gm()
    gmagick.addRawArgs(image, ['-modulate 120'])
    should(image.out.callCount).eql(1)
    should(image.out.args[0]).eql(['-modulate', '120'])
  })

  it('single argument with space-separated values', () => {
    const image = gm()
    gmagick.addRawArgs(image, ['-unsharp 2 0.5 0.5 0'])
    should(image.out.callCount).eql(1)
    should(image.out.args[0]).eql(['-unsharp', '2 0.5 0.5 0'])
  })

  it('multiple arguments', () => {
    const image = gm()
    gmagick.addRawArgs(image, [
      '-equalize',
      '-modulate 120',
      '-unsharp 2 0.5 0.5 0'
    ])
    should(image.out.callCount).eql(3)
    should(image.out.args).eql([
      ['-equalize'],
      ['-modulate', '120'],
      ['-unsharp', '2 0.5 0.5 0']
    ])
  })
})
