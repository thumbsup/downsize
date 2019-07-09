const ffargs = require('../../lib/video/ffargs')

test('crf for h264', () => {
  // Full range is 0-51 (not linear)
  // 17 is already near lossless so we consider it to be 100% quality
  // https://trac.ffmpeg.org/wiki/Encode/H.264
  expect(ffargs.crf(0, 'h264')).toBe(51)
  expect(ffargs.crf(20, 'h264')).toBe(44)
  expect(ffargs.crf(50, 'h264')).toBe(34)
  expect(ffargs.crf(70, 'h264')).toBe(27)
  expect(ffargs.crf(100, 'h264')).toBe(17)
})

test('crf for vpx', () => {
  // Full range is 0-63 (not linear)
  // 15 is already near lossless so we consider it to be 100% quality
  // https://trac.ffmpeg.org/wiki/Encode/VP9
  expect(ffargs.crf(0, 'vpx')).toBe(63)
  expect(ffargs.crf(20, 'vpx')).toBe(53)
  expect(ffargs.crf(50, 'vpx')).toBe(39)
  expect(ffargs.crf(80, 'vpx')).toBe(24)
  expect(ffargs.crf(100, 'vpx')).toBe(15)
})
