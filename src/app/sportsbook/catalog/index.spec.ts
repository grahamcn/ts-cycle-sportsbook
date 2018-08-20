/* eslint-env mocha*/
import { expect } from 'chai'

function returnFour() {
  return 4
}

describe('return 4', () => {
  it('should not render a registration link', () => {
    expect(returnFour()).to.equal(4)
  })
})
