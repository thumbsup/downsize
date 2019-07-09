const gmagick = require('../../lib/image/gmagick')
const sinon = require('sinon')

function gm () {
  return {
    out: sinon.stub()
  }
}

test('no arguments', () => {
  const image = gm()
  gmagick.addRawArgs(image, undefined)
  expect(image.out.callCount).toEqual(0)
})

test('empty array of arguments', () => {
  const image = gm()
  gmagick.addRawArgs(image, [])
  expect(image.out.callCount).toEqual(0)
})

test('single argument with no values', () => {
  const image = gm()
  gmagick.addRawArgs(image, ['-equalize'])
  expect(image.out.callCount).toEqual(1)
  expect(image.out.args[0]).toEqual(['-equalize'])
})

test('single argument with one value', () => {
  const image = gm()
  gmagick.addRawArgs(image, ['-modulate 120'])
  expect(image.out.callCount).toEqual(1)
  expect(image.out.args[0]).toEqual(['-modulate', '120'])
})

test('single argument with space-separated values', () => {
  const image = gm()
  gmagick.addRawArgs(image, ['-unsharp 2 0.5 0.5 0'])
  expect(image.out.callCount).toEqual(1)
  expect(image.out.args[0]).toEqual(['-unsharp', '2 0.5 0.5 0'])
})

test('multiple arguments', () => {
  const image = gm()
  gmagick.addRawArgs(image, [
    '-equalize',
    '-modulate 120',
    '-unsharp 2 0.5 0.5 0'
  ])
  expect(image.out.callCount).toEqual(3)
  expect(image.out.args).toEqual([
    ['-equalize'],
    ['-modulate', '120'],
    ['-unsharp', '2 0.5 0.5 0']
  ])
})
