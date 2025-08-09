// Express routes for item endpoints
import sql from '../infra/db.js'
import axios from 'axios'

export default {
  async listItems(req, res) {
    // Lista os itens no inventário do jogador.  Se o parâmetro
    // `nome` for fornecido na query, delega a busca à PokeAPI para
    // retornar os detalhes do item.
    try {
      const player = await sql`SELECT itens FROM players WHERE id = ${req.params.id}`
      const itens = player[0]?.itens || []
      if (req.query.nome) {
        const poke = await axios.get(`https://pokeapi.co/api/v2/item/${req.query.nome}`)
        return res.json(poke.data)
      }
      res.json(itens)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao listar itens', details: err.message })
    }
  },

async addItem(req, res) {
  const { nome, quantidade = 1, notas } = req.body || {};

  if (!nome) {
    return res.status(400).json({ error: 'Nome do item é obrigatório' });
  }

  const item = {
    id: Date.now().toString(),
    nome,
    quantidade,
    notas
  };

  try {
    // Busca itens existentes
    const result = await sql`
      SELECT itens
      FROM players
      WHERE id = ${req.params.id}
    `;

    let itensFromDB = result[0]?.itens;

    // Garante array e remove objetos vazios
    if (!Array.isArray(itensFromDB)) {
      itensFromDB = itensFromDB ? [itensFromDB] : [];
    }
    itensFromDB = itensFromDB.filter(i => i && Object.keys(i).length > 0);

    // Adiciona o novo item
    itensFromDB.push(item);

    // Salva como jsonb[]
    await sql`
      UPDATE players
      SET itens = ${sql.array(
        itensFromDB.map(i => sql.json(i)),
        'jsonb'
      )}
      WHERE id = ${req.params.id}
    `;

    res.status(201).json(item);

  } catch (err) {
    res.status(500).json({
      error: 'Erro ao adicionar item',
      details: err.message
    });
  }
},

  async updateItem(req, res) {
    // Atualiza campos de um item específico do inventário.
    const { id, itemId } = req.params
    const patch = req.body || {}
    try {
      const result = await sql`SELECT itens FROM players WHERE id = ${id}`
      const itens = result[0]?.itens || []
      const idx = itens.findIndex(i => i.id == itemId)
      if (idx < 0) return res.status(404).json({ error: 'Item não encontrado' })
      itens[idx] = { ...itens[idx], ...patch }
      await sql`UPDATE players SET itens = ${sql.json(itens)} WHERE id = ${id}`
      res.json(itens[idx])
    } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar item', details: err.message })
    }
  },

  async deleteItem(req, res) {
    // Remove um item específico do inventário.
    const { id, itemId } = req.params
    try {
      const result = await sql`SELECT itens FROM players WHERE id = ${id}`
      const itens = result[0]?.itens || []
      const idx = itens.findIndex(i => i.id == itemId)
      if (idx < 0) return res.status(404).json({ error: 'Item não encontrado' })
      itens.splice(idx, 1)
      await sql`UPDATE players SET itens = ${sql.json(itens)} WHERE id = ${id}`
      res.sendStatus(204)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao remover item', details: err.message })
    }
  },

  async useItem(req, res) {
    // Uso rápido de um item pelo nome.  Diminui a quantidade em 1 ou
    // remove o item se a quantidade chegar a zero.  Esta rota foi
    // mantida para compatibilidade, mas o fluxo recomendado é usar
    // updateItem e deleteItem para controle mais granular.
    const { nome } = req.body || {}
    if (!nome) return res.status(400).json({ error: 'Nome do item é obrigatório' })
    try {
      const result = await sql`SELECT itens FROM players WHERE id = ${req.params.id}`
      const itens = result[0]?.itens || []
      const idx = itens.findIndex(i => i.nome === nome)
      if (idx < 0) return res.status(404).json({ error: 'Item não encontrado' })
      if (itens[idx].quantidade && itens[idx].quantidade > 1) {
        itens[idx].quantidade -= 1
      } else {
        itens.splice(idx, 1)
      }
      await sql`UPDATE players SET itens = ${sql.json(itens)} WHERE id = ${req.params.id}`
      res.sendStatus(200)
    } catch (err) {
      res.status(500).json({ error: 'Erro ao usar item', details: err.message })
    }
  }
}
