const diff = require('./diff')

describe('image AVIF', () => {
  it('can process a single-image AVIF file', done => {
    diff.image({
      input: 'images/countryside.avif',
      expect: 'images/countryside.jpg',
      options: {
        height: 200
      }
    }, done)
  })
})
