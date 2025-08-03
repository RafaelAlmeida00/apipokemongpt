// Player business logic
// Express routes for player endpoints
 import sql from '../infra/db.js'
import Player from '../domain/player.js'

export default {
  async createPlayer(req, res) {
    const data = req.body
    const player = new Player(data)
    const result = await sql`INSERT INTO players ${sql(player)} RETURNING *`
    res.json(result[0])
  },

  async getPlayer(req, res) {
    const result = await sql`SELECT * FROM players WHERE id = ${req.params.id}`
    res.json(result[0])
  },

  async setRegion(req, res) {
    const { region } = req.body
    await sql`UPDATE players SET regiao = ${region} WHERE id = ${req.params.id}`
    res.sendStatus(200)
  },

  async chooseStarter(req, res) {
    const { starter } = req.body
    await sql`UPDATE players SET inicial = ${starter} WHERE id = ${req.params.id}`
    res.sendStatus(200)
  },

  async movePlayer(req, res) {
    const { novaLocalizacao } = req.body
    await sql`UPDATE players SET localizacao = ${novaLocalizacao} WHERE id = ${req.params.id}`
    res.sendStatus(200)
  },
    async updatePlayer(req, res) {
    const { id } = req.params
    const updates = req.body

    try {
      const keys = Object.keys(updates)
      for (const key of keys) {
        await sql`UPDATE players SET ${sql(key)} = ${updates[key]} WHERE id = ${id}`
      }
      res.status(200).json({ message: 'Jogador atualizado com sucesso' })
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar jogador', details: err.message })
    }
  }

} 
