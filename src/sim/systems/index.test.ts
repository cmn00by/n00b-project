import { describe, expect, it } from 'vitest'
import { validateSystems } from '../core'
import { SYSTEMS } from './index'

describe('SYSTEMS', () => {
  it('ne contient que des systèmes valides (ids uniques, en kebab-case)', () => {
    expect(validateSystems(SYSTEMS)).toEqual([])
  })
})
