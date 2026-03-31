import { Game } from './game.js'
import { Padlock } from './padlock.js'

document.addEventListener('DOMContentLoaded', () => {
  Game.initialise()
  new Padlock()
})
