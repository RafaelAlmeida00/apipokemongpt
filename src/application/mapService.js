// Map business logic
import axios from 'axios'

export default {
  async getRoutes(req, res) {
    const { region } = req.params
    const { data } = await axios.get(`https://pokeapi.co/api/v2/region/${region}`)
    res.json(data.locations)
  },

  async travelTo(req, res) {
    // Exemplo básico: aceita qualquer rota enviada
    const { rota } = req.body
    // Aqui você pode validar se o jogador pode acessar a rota, com base na API ou lógica
    res.json({ mensagem: `Você viajou para ${rota}` })
  }
}
