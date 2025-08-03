import express from 'express'
import itemService from '../../application/itemService.js'

const router = express.Router()

router.get('/:id/items', itemService.listItems)
router.post('/:id/items/add', itemService.addItem)
router.patch('/:id/items/use', itemService.useItem)

export default router