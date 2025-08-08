import express from 'express'
import axios from 'axios'

const router = express.Router()
const BASE = 'https://pokeapi.co/api/v2'

router.get('/:resource/:id?', async (req, res) => {
  try {
    const { resource, id } = req.params
    const url = id ? `${BASE}/${resource}/${id}` : `${BASE}/${resource}`
    const response = await axios.get(url)
    res.json(response.data)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar recurso da PokéAPI', details: err.message })
  }
})

router.get('/:resource/:subresource/:id', async (req, res) => {
  try {
    const { resource, subresource, id } = req.params
    const url = `${BASE}/${resource}/${subresource}/${id}`
    const response = await axios.get(url)
    res.json(response.data)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar sub-recurso da PokéAPI', details: err.message })
  }
})

export default router