// Pokemon entity model
export default class Pokemon {
  constructor({ id, nome, apelido, saude = 100, movimentos = [], status = null }) {
    this.id = id
    this.nome = nome
    this.apelido = apelido
    this.saude = saude
    this.movimentos = movimentos
    this.status = status
  }
}
