// Item entity model
//
// Em vez de representar um item apenas como uma string, agora
// encapsulamos informações adicionais como uma chave identificadora
// e a quantidade disponível.  Isso permite que a IA rastreie a
// posse de itens com maior fidelidade e facilite operações de
// incremento/decremento.
export default class Item {
  constructor({ id, nome, quantidade = 1, notas }) {
    // ID único do item (string ou número) usado para buscas e
    // atualizações pontuais.  Deve ser fornecido externamente (por
    // exemplo, a partir de um gerador de UUID) quando o item é criado.
    this.id = id
    // Nome do item
    this.nome = nome
    // Quantidade na posse do jogador
    this.quantidade = quantidade
    // Campo opcional para qualquer observação adicional
    this.notas = notas
  }
}