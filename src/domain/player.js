// Player entity model
//
// This class defines the shape of a player in the game.  In addition
// to the original scalar fields and simple string arrays, it now
// supports richer structures for location, events, relationships,
// inventory and Pokémon.  Arrays such as `amigos`, `inimigos`,
// `rivais`, `interesses` and `conhecidos` are expected to contain
// objects with additional metadata instead of plain strings.  The
// `itens` collection holds objects describing each item and its
// quantity.  The `pokemons` collection holds full Pokémon objects
// including level and affinity.
export default class Player {
  constructor({
    id,
    nome,
    aparencia,
    personalidade,
    idade,
    regiao,
    inicial,
    dinheiro,
    reputacao,
    insignias,
    torneios_participados,
    torneios_ganhos,
    amigos,
    inimigos,
    rivais,
    interesses,
    conhecidos,
    itens,
    pokemons,
    localizacao_atual,
    eventos_iconicos
  }) {
    // Identificadores e dados básicos
    this.id = id
    this.nome = nome
    this.aparencia = aparencia
    this.personalidade = personalidade
    this.idade = idade
    this.regiao = regiao
    this.inicial = inicial

    // Atributos numéricos com valores padrão
    this.dinheiro = dinheiro || 3000
    this.reputacao = reputacao || 1

    // Conquistas e progresso
    this.insignias = insignias || []
    this.torneios_participados = torneios_participados || []
    this.torneios_ganhos = torneios_ganhos || []

    // Relacionamentos: agora arrays de objetos.  Cada elemento deve
    // conter pelo menos `id` e `nome`, podendo incluir campos como
    // `local_conheceu`, `descricao` e `tags`.
    this.amigos = amigos || []
    this.inimigos = inimigos || []
    this.rivais = rivais || []
    this.interesses = interesses || []
    this.conhecidos = conhecidos || []

    // Inventário: array de objetos com `id`, `nome` e `quantidade`.
    this.itens = itens || []

    // Lista de pokémons capturados: cada pokémon é um objeto
    // instanciado a partir da classe Pokemon do domínio.
    this.pokemons = pokemons || []

    // Localização atual do jogador: objeto com campos como
    // `regiao`, `cidade`, `area`, `coords` e `observacao`.  Pode ser
    // `null` caso não haja localização registrada.
    this.localizacao_atual = localizacao_atual || null

    // Eventos icônicos vivenciados pelo jogador: array de objetos
    // contendo `id`, `idade`, `local` e `descricao`.
    this.eventos_iconicos = eventos_iconicos || []
  }
}