# thumbsup-downsize

> Convert / resize / transcode / down-sample photos & videos to be web-friendly

This is one of the core modules of [thumbsup.github.io](https://thumbsup.github.io).

[![NPM](http://img.shields.io/npm/v/thumbsup-downsize.svg?style=flat-square)](https://npmjs.org/package/thumbsup-downsize)
[![License](http://img.shields.io/npm/l/thumbsup-downsize.svg?style=flat-square)](https://github.com/thumbsup/thumbsup-downsize)
[![Build Status](http://img.shields.io/travis/thumbsup/downsize.svg?style=flat-square)](http://travis-ci.org/thumbsup/downsize)
[![Dependencies](http://img.shields.io/david/thumbsup/thumbsup-downsize.svg?style=flat-square)](https://david-dm.org/thumbsup/thumbsup-downsize)
[![Dev dependencies](http://img.shields.io/david/dev/thumbsup/thumbsup-downsize.svg?style=flat-square)](https://david-dm.org/thumbsup/thumbsup-downsize)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

## Setup

```bash
npm install thumbsup-downsize --save
```

This module requires [GraphicsMagick](http://www.graphicsmagick.org/)
and [FFMpeg](https://ffmpeg.org/) on the target system, available in the system path.

## Usage

```js
const downsize = require('thumbsup-downsize')

const options = { height: 100, width: 100 }
downsize.image('source.tiff', 'thumb.jpg', options, (err) => {
  console.log(err || 'Thumbnail created successfully')
})
```

## API

### .image

```js
.image(source, target, options, callback)
```

Processes the image in `source` and creates a new image in `target`.
The image is appropriately converted if needed based on the `target` file extension.
You can specify the following options:

```js
// don't resize, just convert
opts = {}

// proportionally resize the photo to a maximum height
opts = {height: 300}

// proportionally resize the photo to a maximum width
opts = {width: 300}

// resize and crop the photo to exactly height x width
// the image will not be distorted
opts = {height: 100, width: 100}

// quality of the target image (0-100)
opts = {quality: 80}

// overlay a watermark on top of the image
opts = {
  watermark: {
    // PNG file with transparency, relative to the working directory
    file: 'path/watermark.png',
    // NorthWest | North | NorthEast | West | Center | East | SouthWest | South | SouthEast
    gravity: 'SouthEast',
    // whether the watermark should be repeated across the whole image
    tile: false
  }
}
```

Note: watermarks are not compatible with cropped images.
The `watermark` option will simply be ignored if both width and height are specified.

### .still

```js
.still(source, target, options, callback)
```

Extract a single frame from the video in `source`, and writes the image to `target`.
This method supports all  the same options as `.image()`.

### .video

```js
.video(source, target, options, callback)
```

Transcodes the video in `source` to a web-friendly format and lower bitrate, and writes it in `target`.
Currently doesn't support any options, simply pass an empty hash (`{}`).

The `.video()` call returns an [EventEmitter](https://nodejs.org/api/events.html)
to follow the progress of the conversion, since it can take a long time.

```js
const emitter = downsize.video(/* ... */)
emitter.on('progress', percent => console.log(`${percent}%`))
```

## Contributing

Image/video resizing is hard to unit test.
Instead, this repo contains an integration test suite made of many different resized files,
covering different file formats and edge cases.

When submitting a change, make sure you run the build locally.

```bash
npm test
```

If you don't have all dependencies installed, you can also run the tests in Docker.

```bash
docker build -t downsize-test .
docker run downsize-test
```
