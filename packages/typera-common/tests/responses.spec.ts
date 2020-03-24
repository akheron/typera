import * as Response from '../src/response'

describe('redirect', () => {
  it('generates the correct response', () => {
    expect(Response.redirect(301, '/bar/baz')).toEqual({
      status: 301,
      body: 'Moved permanently. Redirecting to /bar/baz',
      headers: { location: '/bar/baz' },
    })
  })
})
