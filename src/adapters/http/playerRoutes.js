import express from 'express'
import playerService from '../../application/playerService.js'

const router = express.Router()

router.post('/', playerService.createPlayer)
router.get('/:id', playerService.getPlayer)
router.patch('/:id/region', playerService.setRegion)
router.post('/:id/starter', playerService.chooseStarter)
router.patch('/:id/move', playerService.movePlayer)
router.put('/:id', playerService.updatePlayer)

// Novas rotas para funcionalidades estendidas
// Atualizar localização atual (objeto JSON)
router.patch('/:id/localizacao', playerService.updateLocation)

// Eventos icônicos
router.post('/:id/eventos', playerService.addEvent)
router.patch('/:id/eventos/:eventId', playerService.updateEvent)
router.delete('/:id/eventos/:eventId', playerService.deleteEvent)

// Relacionamentos (amigos, inimigos, rivais, interesses, conhecidos)
router.post('/:id/relacionamentos/:tipo', playerService.addRelationship)
router.patch('/:id/relacionamentos/:tipo/:relId', playerService.updateRelationship)
router.delete('/:id/relacionamentos/:tipo/:relId', playerService.deleteRelationship)


export default router
