const assert = require('assert')
const tape = require('tape')
const ffargs = require('../../lib/video/ffargs')

tape('crf for h264', t => {
  // Full range is 0-51 (not linear)
  // 17 is already near lossless so we consider it to be 100% quality
  // https://trac.ffmpeg.org/wiki/Encode/H.264
  assert.equal(ffargs.crf(0, 'h264'), 51)
  assert.equal(ffargs.crf(20, 'h264'), 44)
  assert.equal(ffargs.crf(50, 'h264'), 34)
  assert.equal(ffargs.crf(70, 'h264'), 27)
  assert.equal(ffargs.crf(100, 'h264'), 17)
  t.end()
})

tape('crf for vpx', t => {
  // Full range is 0-63 (not linear)
  // 15 is already near lossless so we consider it to be 100% quality
  // https://trac.ffmpeg.org/wiki/Encode/VP9
  assert.equal(ffargs.crf(0, 'vpx'), 63)
  assert.equal(ffargs.crf(20, 'vpx'), 53)
  assert.equal(ffargs.crf(50, 'vpx'), 39)
  assert.equal(ffargs.crf(80, 'vpx'), 24)
  assert.equal(ffargs.crf(100, 'vpx'), 15)
  t.end()
})
