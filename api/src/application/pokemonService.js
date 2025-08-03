// Pokemon business logic
import sql from '../infra/db.js'
import axios from 'axios'
import Pokemon from '../domain/pokemon.js'

export default {
  async listPokemon(req, res) {
    const player = await sql`SELECT pokemons FROM players WHERE id = ${req.params.id}`
    const pokemons = player[0].pokemons || []
    if (req.query.nome) {
      const poke = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.query.nome}`)
      const { id, name, types, height, weight } = poke.data
      return res.json({ id, name, types, height, weight })
    }
    res.json(pokemons.map(p => p.nome))
  },

  async catchPokemon(req, res) {
    const { nome } = req.body
    const poke = new Pokemon({ id: Date.now(), nome, apelido: nome })
    await sql`UPDATE players SET pokemons = array_append(pokemons, ${sql.json(poke)}) WHERE id = ${req.params.id}`
    res.sendStatus(200)
  },

  async healPokemon(req, res) {
    const { pid } = req.params
    const player = await sql`SELECT pokemons FROM players WHERE id = ${req.params.id}`
    const pokemons = player[0].pokemons.map(p => p.id == pid ? { ...p, saude: 100 } : p)
    await sql`UPDATE players SET pokemons = ${sql.json(pokemons)} WHERE id = ${req.params.id}`
    res.sendStatus(200)
  },

  async addMove(req, res) {
    const { pid } = req.params
    const { move } = req.body
    const player = await sql`SELECT pokemons FROM players WHERE id = ${req.params.id}`
    const pokemons = player[0].pokemons.map(p => p.id == pid ? { ...p, movimentos: [...p.movimentos, move] } : p)
    await sql`UPDATE players SET pokemons = ${sql.json(pokemons)} WHERE id = ${req.params.id}`
    res.sendStatus(200)
  },

  async setStatus(req, res) {
    const { pid } = req.params
    const { status } = req.body
    const player = await sql`SELECT pokemons FROM players WHERE id = ${req.params.id}`
    const pokemons = player[0].pokemons.map(p => p.id == pid ? { ...p, status } : p)
    await sql`UPDATE players SET pokemons = ${sql.json(pokemons)} WHERE id = ${req.params.id}`
    res.sendStatus(200)
  }
}
