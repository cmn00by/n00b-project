import { describe, expect, it } from 'vitest'
import { toDriveCommand } from './driveCommand'
import type { DriveKeys } from './driveCommand'

const noKeys: DriveKeys = { up: false, down: false, left: false, right: false, handbrake: false }

describe('toDriveCommand', () => {
  it('ne renvoie rien quand on ne touche à rien', () => {
    expect(toDriveCommand(1, noKeys)).toBeUndefined()
  })

  it('accélère, freine et tourne', () => {
    expect(toDriveCommand(1, { ...noKeys, up: true })).toMatchObject({ type: 'vehicle:drive', entityId: 1, throttle: 1, steer: 0 })
    expect(toDriveCommand(1, { ...noKeys, down: true })).toMatchObject({ throttle: -1 })
    expect(toDriveCommand(1, { ...noKeys, up: true, left: true })).toMatchObject({ throttle: 1, steer: -1 })
    expect(toDriveCommand(1, { ...noKeys, right: true })).toMatchObject({ throttle: 0, steer: 1 })
  })

  it('envoie le frein à main seul', () => {
    expect(toDriveCommand(1, { ...noKeys, handbrake: true })).toMatchObject({ throttle: 0, steer: 0, isHandbraking: true })
  })

  it('annule deux touches opposées', () => {
    expect(toDriveCommand(1, { ...noKeys, up: true, down: true, left: true, right: true })).toBeUndefined()
  })
})
