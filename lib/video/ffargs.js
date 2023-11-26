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
  // overwrite the file if already exists
  const args = ['-y']

  // IF VAAPI acceleration needs to go before -i input files
  if ((options.bitrate) && (options.hwaccel === 'vaapi')) {
    args.push('-hwaccel_device', '/dev/dri/renderD128', '-hwaccel', 'vaapi', '-hwaccel_output_format', 'vaapi')
  }

  // source file
  args.push('-i', source)

  // output framerate
  if (options.framerate !== 0) {
    args.push('-r', options.framerate || DEFAULT_VIDEO_FPS)
  }

  // misc options
  args.push('-vsync', '2', '-movflags', '+faststart')

  // remove metadata if required
  if (options.keepMetadata) {
    // the second argument is required
    // to keep non-standard tags like <com.apple.quicktime.location.ISO6709>
    args.push('-map_metadata', '0', '-movflags', 'use_metadata_tags')
  } else {
    args.push('-map_metadata', -1)
  }

  // audio bitrate
  args.push('-ab', DEFAULT_AUDIO_BITRATE)

  // output to mp4 or webm which are well read on the web
  if (options.format === 'webm') {
    args.push('-f', 'webm', '-vcodec', 'libvpx-vp9', '-strict', '-2')
  } else {
    args.push('-f', 'mp4')
    if ((options.bitrate) && (options.hwaccel === 'vaapi')) {
      args.push('-c:v', 'h264_vaapi') // if VAAPI available
    } else {
      args.push('-vcodec', 'libx264')
    }
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

  const filters = exports.videoFilters(source, options)
  args.push('-vf', filters)

  // target filename
  args.push(target)

  return args
}

// This function converts a "quality percentage" into CRF
exports.crf = function (percent, encoder) {
  const range = ENCODER_CRF[encoder].max - ENCODER_CRF[encoder].min
  const proportion = percent * range / 100
  const inverted = ENCODER_CRF[encoder].max - proportion
  return Math.floor(inverted)
}

// Configure video filters
exports.videoFilters = function (source, options) {
  const filters = []
  // AVCHD/MTS videos need a full-frame export to avoid interlacing artefacts
  if (path.extname(source).toLowerCase() === '.mts') {
    filters.push('yadif=1')
  }
  // Configure subsampling and hardware acceleration
  if ((options.bitrate) && (options.hwaccel === 'vaapi')) {
    // VAAPI requires nv12, which is equivalent to yuv420p for an h264 stream
    // Here we could add scaling option too e.g. ",scale_vaapi=1280:-1"
    filters.push('format=nv12|vaapi', 'hwupload')
  } else {
    // Standard case: use YUV420p which has the best compatibility
    filters.push('format=yuv420p')
  }
  return filters.join(',')
}
