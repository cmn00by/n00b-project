import { describe, expect, it } from 'vitest'
import { STEPS_PER_SECOND, TUNING } from '../../core'
import { PEDESTRIAN_STATES, advanceState } from './stateMachine'

const T = TUNING.pedestrians
const FLEE_STEPS = Math.round(T.fleeSeconds * STEPS_PER_SECOND)
const NOTICE_STEPS = Math.round(T.noticeSeconds * STEPS_PER_SECOND)
const WALKING = { state: PEDESTRIAN_STATES.walking, stateStepsLeft: 0 }

describe('advanceState', () => {
  it('continue de se promener quand rien ne se passe', () => {
    expect(advanceState(WALKING, 'ignore', T)).toEqual(WALKING)
  })

  it('remarque ce qui fonce sur lui : il s’arrête et regarde', () => {
    expect(advanceState(WALKING, 'notice', T)).toEqual({ state: PEDESTRIAN_STATES.noticing, stateStepsLeft: NOTICE_STEPS })
  })

  it('prend la fuite, et c’est plus fort que tout', () => {
    const fleeing = { state: PEDESTRIAN_STATES.fleeing, stateStepsLeft: FLEE_STEPS }
    for (const state of Object.values(PEDESTRIAN_STATES)) {
      expect(advanceState({ state, stateStepsLeft: 3 }, 'flee', T)).toEqual(fleeing)
    }
  })

  it('continue de fuir un moment après la peur, puis reprend sa promenade', () => {
    let current = advanceState(WALKING, 'flee', T)
    for (let step = 1; step < FLEE_STEPS; step++) {
      current = advanceState(current, 'ignore', T)
      expect(current.state).toBe(PEDESTRIAN_STATES.fleeing)
    }
    current = advanceState(current, 'ignore', T)
    expect(current).toEqual(WALKING)
  })

  it('remet le chronomètre de fuite à zéro tant que ça fonce sur lui', () => {
    let current = advanceState(WALKING, 'flee', T)
    for (let step = 0; step < 100; step++) current = advanceState(current, 'flee', T)
    expect(current).toEqual({ state: PEDESTRIAN_STATES.fleeing, stateStepsLeft: FLEE_STEPS })
  })

  it('ne remarque pas de nouveau pendant qu’il fuit encore : il finit sa fuite', () => {
    const fleeing = { state: PEDESTRIAN_STATES.fleeing, stateStepsLeft: 10 }
    expect(advanceState(fleeing, 'notice', T)).toEqual({ state: PEDESTRIAN_STATES.fleeing, stateStepsLeft: 9 })
  })

  it('finit sa pause puis reprend sa promenade', () => {
    let current: { state: string; stateStepsLeft: number } = { state: PEDESTRIAN_STATES.pausing, stateStepsLeft: 3 }
    current = advanceState(current, 'ignore', T)
    expect(current).toEqual({ state: PEDESTRIAN_STATES.pausing, stateStepsLeft: 2 })
    current = advanceState(current, 'ignore', T)
    current = advanceState(current, 'ignore', T)
    expect(current).toEqual(WALKING)
  })

  it('interrompt une pause pour regarder ce qui fonce sur lui', () => {
    const pausing = { state: PEDESTRIAN_STATES.pausing, stateStepsLeft: 50 }
    expect(advanceState(pausing, 'notice', T)).toEqual({ state: PEDESTRIAN_STATES.noticing, stateStepsLeft: NOTICE_STEPS })
  })

  it('finit de regarder puis reprend sa promenade quand ça ne le menace plus', () => {
    let current = advanceState(WALKING, 'notice', T)
    for (let step = 0; step < NOTICE_STEPS; step++) current = advanceState(current, 'ignore', T)
    expect(current).toEqual(WALKING)
  })
})
