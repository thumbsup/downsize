const diff = require('./diff')

describe('image HEIC', () => {
  it('can process a single-image HEIC file', done => {
    diff.image({
      input: 'images/heic-single.heic',
      expect: 'images/heic-single.jpg',
      options: {
        height: 300
      }
    }, done)
  })

  it('can process a burst-image HEIC file', done => {
    diff.image({
      input: 'images/heic-burst.heic',
      expect: 'images/heic-burst.jpg',
      options: {
        height: 300
      }
    }, done)
  })

  it('can process a live (photo + video) HEIC file', done => {
    diff.image({
      input: 'images/heic-live.heic',
      expect: 'images/heic-live.jpg',
      options: {
        height: 300
      }
    }, done)
  })

  it('can process a HEIC with a P3 color profile', done => {
    diff.image({
      input: 'images/heic-color-profile.heic',
      expect: 'images/heic-color-profile.jpg',
      options: {
        height: 300
      }
    }, done)
  }, 10000)
})
