// Express routes for item endpoints
import sql from '../infra/db.js'
import axios from 'axios'

export default {
  async listItems(req, res) {
    const player = await sql`SELECT itens FROM players WHERE id = ${req.params.id}`
    const itens = player[0].itens || []
    if (req.query.nome) {
      const poke = await axios.get(`https://pokeapi.co/api/v2/item/${req.query.nome}`)
      return res.json(poke.data)
    }
    res.json(itens)
  },

  async addItem(req, res) {
    const { nome } = req.body
    await sql`UPDATE players SET itens = array_append(itens, ${nome}) WHERE id = ${req.params.id}`
    res.sendStatus(200)
  },

  async useItem(req, res) {
    const { nome } = req.body
    await sql`UPDATE players SET itens = array_remove(itens, ${nome}) WHERE id = ${req.params.id}`
    res.sendStatus(200)
  }
}