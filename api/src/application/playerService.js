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
  }
} 
