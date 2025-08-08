// Player business logic
// Express routes for player endpoints
 import sql from '../infra/db.js'
import Player from '../domain/player.js'

export default {
  async createPlayer(req, res) {
    const data = req.body
    const player = new Player(data)

// Remove campos com undefined
const sanitized = Object.fromEntries(
  Object.entries(player).filter(([_, v]) => v !== undefined)
)

const result = await sql`INSERT INTO players ${sql(sanitized)} RETURNING *`
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
    // Rota legada para movimentação.  Por compatibilidade com
    // implementações anteriores, usamos o nome de campo antigo
    // `localizacao` se ele existir.  A nova recomendação é
    // utilizar o método updateLocation abaixo, que atualiza o
    // campo `localizacao_atual` com um objeto JSON.
    const { novaLocalizacao } = req.body
    await sql`UPDATE players SET localizacao_atual = ${sql.json(novaLocalizacao)} WHERE id = ${req.params.id}`
    res.sendStatus(200)
  },

  async updateLocation(req, res) {
    // Atualiza a localização atual do jogador.  O corpo deve
    // conter um objeto com as chaves desejadas (regiao, cidade,
    // area, coords, observacao...).
    const { id } = req.params
    const novaLocalizacao = req.body
    try {
      await sql`UPDATE players SET localizacao_atual = ${sql.json(novaLocalizacao)} WHERE id = ${id}`
      res.status(200).json({ message: 'Localização atualizada com sucesso' })
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar localização', details: err.message })
    }
  },

  async updatePlayer(req, res) {
    const { id } = req.params
    const updates = req.body
    try {
      const keys = Object.keys(updates)
      for (const key of keys) {
        const value = updates[key]
        // Para objetos e arrays, use json() para gerar JSON válido.
        if (value && typeof value === 'object') {
          await sql`UPDATE players SET ${sql(key)} = ${sql.json(value)} WHERE id = ${id}`
        } else {
          await sql`UPDATE players SET ${sql(key)} = ${value} WHERE id = ${id}`
        }
      }
      res.status(200).json({ message: 'Jogador atualizado com sucesso' })
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar jogador', details: err.message })
    }
  },

  // ---------- Eventos Icônicos ----------
  async addEvent(req, res) {
    // Adiciona um novo evento icônico à lista do jogador.  O corpo
    // deve conter pelo menos `idade` e `descricao`, além de outras
    // informações como `local` ou `tags`.
    const { id } = req.params
    const dados = req.body || {}
    const evento = { id: Date.now().toString(), ...dados }
    try {
      const result = await sql`SELECT eventos_iconicos FROM players WHERE id = ${id}`
      const eventos = result[0]?.eventos_iconicos || []
      eventos.push(evento)
      await sql`UPDATE players SET eventos_iconicos = ${sql.json(eventos)} WHERE id = ${id}`
      res.status(201).json(evento)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao adicionar evento', details: err.message })
    }
  },

  async updateEvent(req, res) {
    // Atualiza parcialmente um evento icônico pelo seu identificador.
    const { id, eventId } = req.params
    const patch = req.body || {}
    try {
      const result = await sql`SELECT eventos_iconicos FROM players WHERE id = ${id}`
      const eventos = result[0]?.eventos_iconicos || []
      const idx = eventos.findIndex(e => e.id == eventId)
      if (idx < 0) return res.status(404).json({ error: 'Evento não encontrado' })
      eventos[idx] = { ...eventos[idx], ...patch }
      await sql`UPDATE players SET eventos_iconicos = ${sql.json(eventos)} WHERE id = ${id}`
      res.json(eventos[idx])
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar evento', details: err.message })
    }
  },

  async deleteEvent(req, res) {
    // Remove um evento icônico específico pelo seu identificador.
    const { id, eventId } = req.params
    try {
      const result = await sql`SELECT eventos_iconicos FROM players WHERE id = ${id}`
      const eventos = result[0]?.eventos_iconicos || []
      const idx = eventos.findIndex(e => e.id == eventId)
      if (idx < 0) return res.status(404).json({ error: 'Evento não encontrado' })
      eventos.splice(idx, 1)
      await sql`UPDATE players SET eventos_iconicos = ${sql.json(eventos)} WHERE id = ${id}`
      res.sendStatus(204)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao excluir evento', details: err.message })
    }
  },

  // ---------- Relacionamentos (amigos, inimigos, rivais, interesses, conhecidos) ----------
  async addRelationship(req, res) {
    const { id, tipo } = req.params
    const permitido = ['amigos', 'inimigos', 'rivais', 'interesses', 'conhecidos']
    if (!permitido.includes(tipo)) return res.status(400).json({ error: 'Tipo de relacionamento inválido' })
    const dados = req.body || {}
    const rel = { id: Date.now().toString(), ...dados }
    try {
      const result = await sql`SELECT ${sql(tipo)} FROM players WHERE id = ${id}`
      const lista = result[0]?.[tipo] || []
      lista.push(rel)
      await sql`UPDATE players SET ${sql(tipo)} = ${sql.json(lista)} WHERE id = ${id}`
      res.status(201).json(rel)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao adicionar relacionamento', details: err.message })
    }
  },

  async updateRelationship(req, res) {
    const { id, tipo, relId } = req.params
    const permitido = ['amigos', 'inimigos', 'rivais', 'interesses', 'conhecidos']
    if (!permitido.includes(tipo)) return res.status(400).json({ error: 'Tipo de relacionamento inválido' })
    const patch = req.body || {}
    try {
      const result = await sql`SELECT ${sql(tipo)} FROM players WHERE id = ${id}`
      const lista = result[0]?.[tipo] || []
      const idx = lista.findIndex(r => r.id == relId)
      if (idx < 0) return res.status(404).json({ error: 'Relacionamento não encontrado' })
      lista[idx] = { ...lista[idx], ...patch }
      await sql`UPDATE players SET ${sql(tipo)} = ${sql.json(lista)} WHERE id = ${id}`
      res.json(lista[idx])
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar relacionamento', details: err.message })
    }
  },

  async deleteRelationship(req, res) {
    const { id, tipo, relId } = req.params
    const permitido = ['amigos', 'inimigos', 'rivais', 'interesses', 'conhecidos']
    if (!permitido.includes(tipo)) return res.status(400).json({ error: 'Tipo de relacionamento inválido' })
    try {
      const result = await sql`SELECT ${sql(tipo)} FROM players WHERE id = ${id}`
      const lista = result[0]?.[tipo] || []
      const idx = lista.findIndex(r => r.id == relId)
      if (idx < 0) return res.status(404).json({ error: 'Relacionamento não encontrado' })
      lista.splice(idx, 1)
      await sql`UPDATE players SET ${sql(tipo)} = ${sql.json(lista)} WHERE id = ${id}`
      res.sendStatus(204)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao excluir relacionamento', details: err.message })
    }
  }

} 
