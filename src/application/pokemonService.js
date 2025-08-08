// Pokemon business logic
import sql from '../infra/db.js'
import axios from 'axios'
import Pokemon from '../domain/pokemon.js'

export default {
  async listPokemon(req, res) {
    // Lista os Pokémons do jogador.  Se `nome` estiver presente na
    // query, realiza uma busca na PokeAPI para retornar detalhes de um
    // Pokémon específico.  Caso contrário, retorna todos os objetos
    // armazenados, incluindo nível e afinidade.
    try {
      const player = await sql`SELECT pokemons FROM players WHERE id = ${req.params.id}`
      const pokemons = player[0]?.pokemons || []
      if (req.query.nome) {
        const poke = await axios.get(`https://pokeapi.co/api/v2/pokemon/${req.query.nome}`)
        const { id, name, types, height, weight } = poke.data
        return res.json({ id, name, types, height, weight })
      }
      res.json(pokemons)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar pokémons', details: err.message })
    }
  },

  async catchPokemon(req, res) {
    // Captura um novo Pokémon para o jogador.  O corpo deve conter
    // ao menos `nome`.  Por padrão, o apelido inicial é igual ao nome
    // e os campos `nivel` e `afinidade` são definidos pelo modelo
    // Pokemon (respectivamente 1 e 50).
    const { nome, apelido } = req.body || {}
    if (!nome) return res.status(400).json({ error: 'Nome do Pokémon é obrigatório' })
    try {
      const poke = new Pokemon({ id: Date.now().toString(), nome, apelido: apelido || nome })
      const result = await sql`SELECT pokemons FROM players WHERE id = ${req.params.id}`
      const pokemons = result[0]?.pokemons || []
      pokemons.push(poke)
      await sql`UPDATE players SET pokemons = ${sql.json(pokemons)} WHERE id = ${req.params.id}`
      res.status(201).json(poke)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao capturar Pokémon', details: err.message })
    }
  },

  async healPokemon(req, res) {
    const { id, pid } = req.params
    try {
      const result = await sql`SELECT pokemons FROM players WHERE id = ${id}`
      const pokemons = result[0]?.pokemons || []
      const novos = pokemons.map(p => p.id == pid ? { ...p, saude: 100 } : p)
      await sql`UPDATE players SET pokemons = ${sql.json(novos)} WHERE id = ${id}`
      res.sendStatus(200)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao curar Pokémon', details: err.message })
    }
  },

  async addMove(req, res) {
    const { id, pid } = req.params
    const { move } = req.body || {}
    if (!move) return res.status(400).json({ error: 'Nome do movimento é obrigatório' })
    try {
      const result = await sql`SELECT pokemons FROM players WHERE id = ${id}`
      const pokemons = result[0]?.pokemons || []
      const novos = pokemons.map(p => p.id == pid ? { ...p, movimentos: [...p.movimentos, move] } : p)
      await sql`UPDATE players SET pokemons = ${sql.json(novos)} WHERE id = ${id}`
      res.sendStatus(200)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao adicionar movimento', details: err.message })
    }
  },

  async setStatus(req, res) {
    const { id, pid } = req.params
    const { status } = req.body || {}
    try {
      const result = await sql`SELECT pokemons FROM players WHERE id = ${id}`
      const pokemons = result[0]?.pokemons || []
      const novos = pokemons.map(p => p.id == pid ? { ...p, status } : p)
      await sql`UPDATE players SET pokemons = ${sql.json(novos)} WHERE id = ${id}`
      res.sendStatus(200)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao definir status', details: err.message })
    }
  },

  // Atualiza parcialmente os atributos de um Pokémon específico
  async updatePokemon(req, res) {
    const { id, pid } = req.params
    const patch = req.body || {}
    try {
      const result = await sql`SELECT pokemons FROM players WHERE id = ${id}`
      const pokemons = result[0]?.pokemons || []
      const idx = pokemons.findIndex(p => p.id == pid)
      if (idx < 0) return res.status(404).json({ error: 'Pokémon não encontrado' })
      pokemons[idx] = { ...pokemons[idx], ...patch }
      await sql`UPDATE players SET pokemons = ${sql.json(pokemons)} WHERE id = ${id}`
      res.json(pokemons[idx])
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar Pokémon', details: err.message })
    }
  },

  // Remove um Pokémon específico do treinador
  async deletePokemon(req, res) {
    const { id, pid } = req.params
    try {
      const result = await sql`SELECT pokemons FROM players WHERE id = ${id}`
      const pokemons = result[0]?.pokemons || []
      const idx = pokemons.findIndex(p => p.id == pid)
      if (idx < 0) return res.status(404).json({ error: 'Pokémon não encontrado' })
      pokemons.splice(idx, 1)
      await sql`UPDATE players SET pokemons = ${sql.json(pokemons)} WHERE id = ${id}`
      res.sendStatus(204)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao remover Pokémon', details: err.message })
    }
  }
}
