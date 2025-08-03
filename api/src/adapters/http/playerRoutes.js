import express from 'express'
import playerService from '../../application/playerService.js'

const router = express.Router()

router.post('/', playerService.createPlayer)
router.get('/:id', playerService.getPlayer)
router.patch('/:id/region', playerService.setRegion)
router.post('/:id/starter', playerService.chooseStarter)
router.patch('/:id/move', playerService.movePlayer)

export default router