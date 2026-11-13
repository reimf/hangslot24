import { Padlock } from './padlock.js'
import { State } from './state.js'

document.addEventListener('DOMContentLoaded', async () => {
  await State.initialise()
  new Padlock()
})
