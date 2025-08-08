// Pokemon entity model
//
// O modelo de Pokémon foi estendido para incluir os campos de nível
// (`nivel`) e afinidade (`afinidade`) com o treinador.  Esses
// atributos adicionais ajudam a descrever o progresso do Pokémon e
// seu relacionamento com o jogador, facilitando mecânicas como
// evolução ou aprendizado de movimentos.
export default class Pokemon {
  constructor({
    id,
    nome,
    apelido,
    saude = 100,
    movimentos = [],
    status = null,
    nivel = 1,
    afinidade = 50
  }) {
    this.id = id
    this.nome = nome
    this.apelido = apelido
    this.saude = saude
    this.movimentos = movimentos
    this.status = status
    this.nivel = nivel
    this.afinidade = afinidade
  }
}
