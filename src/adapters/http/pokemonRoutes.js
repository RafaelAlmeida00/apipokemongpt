import express from 'express'
import pokemonService from '../../application/pokemonService.js'

const router = express.Router()

router.get('/:id/pokemon', pokemonService.listPokemon)
router.post('/:id/pokemon/catch', pokemonService.catchPokemon)
router.patch('/:id/pokemon/:pid/heal', pokemonService.healPokemon)
router.patch('/:id/pokemon/:pid/move', pokemonService.addMove)
router.patch('/:id/pokemon/:pid/status', pokemonService.setStatus)

export default router