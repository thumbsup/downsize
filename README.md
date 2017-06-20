# thumbsup-downsize

> Convert / resize / transcode / down-sample photos & videos to be web-friendly

This is one of the core modules of [thumbsup.github.io](https://thumbsup.github.io).

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
Optionally specify `options` to resize the image:

```js
// don't resize, just convert
opts = {}

// proportionally resize the photo to a maximum height
opts = {height}

// proportionally resize the photo to a maximum width
opts = {width}

// resize and crop the photo to exactly height x width (aspect ratio preserved)
opts = {height, width}
```

### .still

```js
.still(source, target, options, callback)
```

Extract a single frame from the video in `source`, and writes the image to `target`.
Optionally specify `options` to resize the image:

```js
// don't resize
opts = {}

// proportionally resize the still to a maximum height
opts = {height}

// proportionally resize the still to a maximum width
opts = {width}

// resize and crop the still to exactly height x width (aspect ratio preserved)
opts = {height, width}
```

### .video

```js
.video(source, target, options, callback)
```

Transcodes the video in `source` to a web-friendly format and lower bitrate, and writes it in `target`.
Currently doesn't support any options, simply pass an empty hash (`{}`).

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
