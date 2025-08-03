// Express routes for map endpoints
import express from 'express'
import mapService from '../../application/mapService.js'

const router = express.Router()

router.get('/:region/routes', mapService.getRoutes)
router.post('/:id/travel', mapService.travelTo)

export default router
