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

  describe('video filters', () => {
    it('uses yuv420p chroma subsampling by default', () => {
      // videos from recent iPhones use yuv420p10le
      // once converted to h264 they don't play well in browsers / macOS finder
      // ffmpeg recommends using yuv420p for best compatibility
      // see http://trac.ffmpeg.org/wiki/Encode/H.264
      // and https://trac.ffmpeg.org/wiki/Encode/VP9
      const vf = ffargs.videoFilters('source.mov', {})
      should(vf).match(/format=yuv420p/)
    })

    it('handles MTS interlacing', () => {
      const vf = ffargs.videoFilters('source.mts', {})
      should(vf).match(/yadif=1,format=yuv420p/)
    })

    it('handles VAAPI hardware acceleration', () => {
      const vf = ffargs.videoFilters('source.mov', { hwaccel: 'vaapi', bitrate: '1200k' })
      should(vf).match(/format=nv12\|vaapi,hwupload/)
    })

    it('passes the video filter argument', () => {
      const args = ffargs.prepare('source.mov', 'target.mp4', {})
      const str = args.join(' ')
      should(str).match(/-vf format=yuv420p/)
    })
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
