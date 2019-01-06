const path = require('path')

const DEFAULT_AUDIO_BITRATE = '96k'
const DEFAULT_VIDEO_FPS = 25
const DEFAULT_VIDEO_QUALITY = 75

// See tests to understand why these values were picked
const ENCODER_CRF = {
  h264: { min: 17, max: 51 },
  vpx: { min: 15, max: 63 }
}

exports.prepare = function (source, target, options) {
  // source file
  const args = ['-i', source]

  // output framerate
  args.push('-r', DEFAULT_VIDEO_FPS)

  // misc options
  args.push('-vsync', '2', '-movflags', '+faststart')

  // audio bitrate
  args.push('-ab', DEFAULT_AUDIO_BITRATE)

  // output to mp4 or webm which are well read on the web
  if (options.format === 'webm') {
    args.push('-f', 'webm', '-vcodec', 'libvpx-vp9', '-strict', '-2')
  } else {
    args.push('-f', 'mp4', '-vcodec', 'libx264')
  }

  // set average video bitrate or perceptual quality
  if (options.bitrate) {
    args.push('-b:v', options.bitrate)
  } else {
    // TODO: add configurable CRF value
    const quality = options.quality || DEFAULT_VIDEO_QUALITY
    const encoder = (options.format === 'webm') ? 'vpx' : 'h264'
    args.push('-b:v', 0, '-crf', exports.crf(quality, encoder))
  }

  // AVCHD/MTS videos need a full-frame export to avoid interlacing artefacts
  if (path.extname(source).toLowerCase() === '.mts') {
    args.push('-vf', 'yadif=1')
  }

  // target filename
  args.push('-y', target)

  return args
}

// This function converts a "quality percentage" into CRF
exports.crf = function (percent, encoder) {
  const range = ENCODER_CRF[encoder].max - ENCODER_CRF[encoder].min
  const proportion = percent * range / 100
  const inverted = ENCODER_CRF[encoder].max - proportion
  return Math.floor(inverted)
}
