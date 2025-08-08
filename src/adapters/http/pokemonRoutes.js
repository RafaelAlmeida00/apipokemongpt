import express from 'express'
import pokemonService from '../../application/pokemonService.js'

const router = express.Router()

router.get('/:id/pokemon', pokemonService.listPokemon)
router.post('/:id/pokemon/catch', pokemonService.catchPokemon)
router.patch('/:id/pokemon/:pid/heal', pokemonService.healPokemon)
router.patch('/:id/pokemon/:pid/move', pokemonService.addMove)
router.patch('/:id/pokemon/:pid/status', pokemonService.setStatus)

// Rota para atualização parcial de um Pokémon (nivel, afinidade, apelido, etc.)
router.patch('/:id/pokemon/:pid', pokemonService.updatePokemon)

// Rota para remover um Pokémon específico
router.delete('/:id/pokemon/:pid', pokemonService.deletePokemon)

export default router