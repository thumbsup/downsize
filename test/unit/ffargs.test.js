const should = require('should/as-function')
const ffargs = require('../../lib/video/ffargs')

describe('ffargs', () => {
  it('crf for h264', () => {
    // Full range is 0-51 (not linear)
    // 17 is already near lossless so we consider it to be 100% quality
    // https://trac.ffmpeg.org/wiki/Encode/H.264
    should(ffargs.crf(0, 'h264')).eql(51)
    should(ffargs.crf(20, 'h264')).eql(44)
    should(ffargs.crf(50, 'h264')).eql(34)
    should(ffargs.crf(70, 'h264')).eql(27)
    should(ffargs.crf(100, 'h264')).eql(17)
  })

  it('crf for vpx', () => {
    // Full range is 0-63 (not linear)
    // 15 is already near lossless so we consider it to be 100% quality
    // https://trac.ffmpeg.org/wiki/Encode/VP9
    should(ffargs.crf(0, 'vpx')).eql(63)
    should(ffargs.crf(20, 'vpx')).eql(53)
    should(ffargs.crf(50, 'vpx')).eql(39)
    should(ffargs.crf(80, 'vpx')).eql(24)
    should(ffargs.crf(100, 'vpx')).eql(15)
  })

  it('handles MTS interlacing', () => {
    const args = ffargs.prepare('source.mts', 'target.mp4', {})
    const str = args.join(' ')
    should(str).match(/-vf yadif=1/)
  })

  describe('framerate', () => {
    it('sets to a default value if not specified', () => {
      const args = ffargs.prepare('source.mts', 'target.mp4', {})
      const str = args.join(' ')
      should(str).match(/-r 25/)
    })

    it('can specify a value', () => {
      const args = ffargs.prepare('source.mts', 'target.mp4', { framerate: 60 })
      const str = args.join(' ')
      should(str).match(/-r 60/)
    })

    it('keeps the source framerate if set to 0', () => {
      const args = ffargs.prepare('source.mts', 'target.mp4', { framerate: 0 })
      const str = args.join(' ')
      should(str).not.match(/-r/)
    })
  })
})
