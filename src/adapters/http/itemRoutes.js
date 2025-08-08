import express from 'express'
import itemService from '../../application/itemService.js'

const router = express.Router()

router.get('/:id/items', itemService.listItems)
router.post('/:id/items/add', itemService.addItem)
router.patch('/:id/items/use', itemService.useItem)

// Rota para atualizar um item específico do inventário
router.patch('/:id/items/:itemId', itemService.updateItem)

// Rota para remover um item específico do inventário
router.delete('/:id/items/:itemId', itemService.deleteItem)

export default router