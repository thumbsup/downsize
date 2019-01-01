const gmagick = require('../../lib/image/gmagick')
const sinon = require('sinon')
const tape = require('tape')

function gm () {
  return {
    out: sinon.stub()
  }
}

tape('no arguments', t => {
  t.plan(1)
  const image = gm()
  gmagick.addRawArgs(image, undefined)
  t.equal(image.out.callCount, 0)
  t.end()
})

tape('empty array of arguments', t => {
  t.plan(1)
  const image = gm()
  gmagick.addRawArgs(image, [])
  t.equal(image.out.callCount, 0)
  t.end()
})

tape('single argument with no values', t => {
  t.plan(2)
  const image = gm()
  gmagick.addRawArgs(image, ['-equalize'])
  t.equal(image.out.callCount, 1)
  t.deepEqual(image.out.args[0], ['-equalize'])
  t.end()
})

tape('single argument with one value', t => {
  t.plan(2)
  const image = gm()
  gmagick.addRawArgs(image, ['-modulate 120'])
  t.equal(image.out.callCount, 1)
  t.deepEqual(image.out.args[0], ['-modulate', '120'])
  t.end()
})

tape('single argument with space-separated values', t => {
  t.plan(2)
  const image = gm()
  gmagick.addRawArgs(image, ['-unsharp 2 0.5 0.5 0'])
  t.equal(image.out.callCount, 1)
  t.deepEqual(image.out.args[0], ['-unsharp', '2 0.5 0.5 0'])
  t.end()
})

tape('multiple arguments', t => {
  t.plan(2)
  const image = gm()
  gmagick.addRawArgs(image, [
    '-equalize',
    '-modulate 120',
    '-unsharp 2 0.5 0.5 0'
  ])
  t.equal(image.out.callCount, 3)
  t.deepEqual(image.out.args, [
    ['-equalize'],
    ['-modulate', '120'],
    ['-unsharp', '2 0.5 0.5 0']
  ])
  t.end()
})
