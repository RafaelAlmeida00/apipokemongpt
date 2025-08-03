// Player entity model
export default class Player {
  constructor({ id, nome, aparencia, personalidade, idade, regiao, inicial, dinheiro, reputacao, insignias, torneios_participados, torneios_ganhos, amigos, inimigos, rivais, interesses, conhecidos, itens, pokemons }) {
    this.id = id
    this.nome = nome
    this.aparencia = aparencia
    this.personalidade = personalidade
    this.idade = idade
    this.regiao = regiao
    this.inicial = inicial
    this.dinheiro = dinheiro || 3000
    this.reputacao = reputacao || 1
    this.insignias = insignias || []
    this.torneios_participados = torneios_participados || []
    this.torneios_ganhos = torneios_ganhos || []
    this.amigos = amigos || []
    this.inimigos = inimigos || []
    this.rivais = rivais || []
    this.interesses = interesses || []
    this.conhecidos = conhecidos || []
    this.itens = itens || []
    this.pokemons = pokemons || []
  }
}