// Player business logic
// Express routes for player endpoints
import sql from '../infra/db.js';
import Player from '../domain/player.js';

export default {
  async createPlayer(req, res) {
    const data = req.body;
    const player = new Player(data);

    // Remove campos com undefined
    const sanitized = Object.fromEntries(
      Object.entries(player).filter(([_, v]) => v !== undefined)
    );

    const result = await sql`INSERT INTO players ${sql(sanitized)} RETURNING *`;
    res.json(result[0]);
  },

  async getPlayer(req, res) {
    const result = await sql`
      SELECT * FROM players WHERE id = ${req.params.id}
    `;
    res.json(result[0]);
  },

  async setRegion(req, res) {
    const { region } = req.body;
    await sql`
      UPDATE players
      SET regiao = ${region}
      WHERE id = ${req.params.id}
    `;
    res.sendStatus(200);
  },

  async chooseStarter(req, res) {
    const { starter } = req.body;
    await sql`
      UPDATE players
      SET inicial = ${starter}
      WHERE id = ${req.params.id}
    `;
    res.sendStatus(200);
  },

  async movePlayer(req, res) {
    // Mantém compatibilidade com campo legado de localização.
    const { novaLocalizacao } = req.body;
    await sql`
      UPDATE players
      SET localizacao_atual = ${sql.json(novaLocalizacao)}
      WHERE id = ${req.params.id}
    `;
    res.sendStatus(200);
  },

  async updateLocation(req, res) {
    // Atualiza a localização atual do jogador.
    const { id } = req.params;
    const novaLocalizacao = req.body;
    try {
      await sql`
        UPDATE players
        SET localizacao_atual = ${sql.json(novaLocalizacao)}
        WHERE id = ${id}
      `;
      res.status(200).json({ message: 'Localização atualizada com sucesso' });
    } catch (err) {
      res.status(500).json({
        error: 'Erro ao atualizar localização',
        details: err.message
      });
    }
  },

 async updatePlayer(req, res) {
  const { id } = req.params;

  // Campos simples que aceitamos via query
  const simpleFields = [
    'nome',
    'aparencia',
    'personalidade',
    'idade',
    'regiao',
    'inicial',
    'dinheiro',
    'reputacao'
  ];

  // Constrói o patch a partir da query string e converte numéricos
  const patch = {};
  simpleFields.forEach((key) => {
    if (req.query[key] !== undefined) {
      let val = req.query[key];
      if (['idade', 'dinheiro', 'reputacao'].includes(key)) {
        val = Number(val);
      }
      patch[key] = val;
    }
  });

  // O corpo JSON, se existir, sobrepõe os valores da query
  Object.assign(patch, req.body || {});

  // Arrays de texto que também podem vir por query ou body
  const arrayUpdates = {};
  ['insignias', 'torneios_participados', 'torneios_ganhos'].forEach((field) => {
    if (req.query[field] !== undefined) {
      // Split por vírgula e remove espaços extras
      // (Express já decodifica + e %20 em espaços)
      arrayUpdates[field] = req.query[field]
        .split(',')
        .map((s) => s.trim());
    } else if (req.body && Array.isArray(req.body[field])) {
      arrayUpdates[field] = req.body[field];
    }
  });

  // Campos jsonb[] que têm handlers específicos (eventos, amigos, etc.)
  const jsonbArrayFields = [
    'eventos_iconicos',
    'amigos',
    'inimigos',
    'rivais',
    'interesses',
    'conhecidos'
  ];

  try {
    // Atualiza campos simples (ignorando jsonb[] e arrays de texto)
    for (const key of Object.keys(patch)) {
      if (
        jsonbArrayFields.includes(key) ||
        ['insignias', 'torneios_participados', 'torneios_ganhos'].includes(key)
      ) {
        continue;
      }
      const value = patch[key];
      if (value && typeof value === 'object') {
        await sql`
          UPDATE players
          SET ${sql(key)} = ${sql.json(value)}
          WHERE id = ${id}
        `;
      } else {
        await sql`
          UPDATE players
          SET ${sql(key)} = ${value}
          WHERE id = ${id}
        `;
      }
    }

    // Atualiza arrays de texto (insignias e torneios) se presentes
    for (const field of Object.keys(arrayUpdates)) {
      const values = arrayUpdates[field];
      // Constrói literal para text[] — cada valor entre aspas
      const arrLiteral =
        '{' +
        values
          .map((item) => '"' + item.replace(/"/g, '\\"') + '"')
          .join(',') +
        '}';
      await sql`
        UPDATE players
        SET ${sql(field)} = ${arrLiteral}::text[]
        WHERE id = ${id}
      `;
    }

    res.status(200).json({ message: 'Jogador atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({
      error: 'Erro ao atualizar jogador',
      details: err.message
    });
  }
},

  // ---------- Eventos Icônicos ----------
  async addEvent(req, res) {
    const { id } = req.params;
    const dados = req.body || {};
    const evento = { id: Date.now().toString(), ...dados };
    try {
      // Concatena o novo evento como jsonb[] sem carregar a lista inteira
      await sql`
        UPDATE players
        SET eventos_iconicos = COALESCE(eventos_iconicos, ARRAY[]::jsonb[])
                                || ARRAY[${sql.json(evento)}]::jsonb[]
        WHERE id = ${id}
      `;
      res.status(201).json(evento);
    } catch (err) {
      res.status(500).json({
        error: 'Erro ao adicionar evento',
        details: err.message
      });
    }
  },

  async updateEvent(req, res) {
    const { id, eventId } = req.params;
    const patch = req.body || {};
    try {
      const [player] = await sql`
        SELECT eventos_iconicos
        FROM players
        WHERE id = ${id}
      `;
      let eventos = player?.eventos_iconicos ?? [];
      if (!Array.isArray(eventos)) eventos = [eventos];
      eventos = eventos.map((e) =>
        typeof e === 'string' ? JSON.parse(e) : e
      );

      const idx = eventos.findIndex((e) => e.id == eventId);
      if (idx < 0) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }

      eventos[idx] = { ...eventos[idx], ...patch };

      const arrLiteral =
        '{' +
        eventos
          .map((item) =>
            '"' + JSON.stringify(item).replace(/"/g, '\\"') + '"'
          )
          .join(',') +
        '}';

      await sql`
        UPDATE players
        SET eventos_iconicos = ${arrLiteral}::jsonb[]
        WHERE id = ${id}
      `;
      res.json(eventos[idx]);
    } catch (err) {
      res.status(500).json({
        error: 'Erro ao atualizar evento',
        details: err.message
      });
    }
  },

  async deleteEvent(req, res) {
    const { id, eventId } = req.params;
    try {
      const [player] = await sql`
        SELECT eventos_iconicos
        FROM players
        WHERE id = ${id}
      `;
      let eventos = player?.eventos_iconicos ?? [];
      if (!Array.isArray(eventos)) eventos = [eventos];
      eventos = eventos.map((e) =>
        typeof e === 'string' ? JSON.parse(e) : e
      );

      const idx = eventos.findIndex((e) => e.id == eventId);
      if (idx < 0) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }

      eventos.splice(idx, 1);

      const arrLiteral =
        '{' +
        eventos
          .map((item) =>
            '"' + JSON.stringify(item).replace(/"/g, '\\"') + '"'
          )
          .join(',') +
        '}';

      await sql`
        UPDATE players
        SET eventos_iconicos = ${arrLiteral}::jsonb[]
        WHERE id = ${id}
      `;
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({
        error: 'Erro ao excluir evento',
        details: err.message
      });
    }
  },

  // ---------- Relacionamentos (amigos, inimigos, rivais, interesses, conhecidos) ----------
  async addRelationship(req, res) {
    const { id, tipo } = req.params;
    const permitido = [
      'amigos',
      'inimigos',
      'rivais',
      'interesses',
      'conhecidos'
    ];
    if (!permitido.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de relacionamento inválido' });
    }
    const dados = req.body || {};
    const rel = { id: Date.now().toString(), ...dados };
    try {
      // Concatena usando jsonb[]
      await sql`
        UPDATE players
        SET ${sql(tipo)} = COALESCE(${sql(tipo)}, ARRAY[]::jsonb[])
                          || ARRAY[${sql.json(rel)}]::jsonb[]
        WHERE id = ${id}
      `;
      res.status(201).json(rel);
    } catch (err) {
      res.status(500).json({
        error: 'Erro ao adicionar relacionamento',
        details: err.message
      });
    }
  },

  async updateRelationship(req, res) {
    const { id, tipo, relId } = req.params;
    const permitido = [
      'amigos',
      'inimigos',
      'rivais',
      'interesses',
      'conhecidos'
    ];
    if (!permitido.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de relacionamento inválido' });
    }
    const patch = req.body || {};
    try {
      const [player] = await sql`
        SELECT ${sql(tipo)}
        FROM players
        WHERE id = ${id}
      `;
      let lista = player?.[tipo] ?? [];
      if (!Array.isArray(lista)) lista = [lista];
      lista = lista.map((r) =>
        typeof r === 'string' ? JSON.parse(r) : r
      );

      const idx = lista.findIndex((r) => r.id == relId);
      if (idx < 0) {
        return res.status(404).json({ error: 'Relacionamento não encontrado' });
      }

      lista[idx] = { ...lista[idx], ...patch };

      const arrLiteral =
        '{' +
        lista
          .map((item) =>
            '"' + JSON.stringify(item).replace(/"/g, '\\"') + '"'
          )
          .join(',') +
        '}';

      await sql`
        UPDATE players
        SET ${sql(tipo)} = ${arrLiteral}::jsonb[]
        WHERE id = ${id}
      `;
      res.json(lista[idx]);
    } catch (err) {
      res.status(500).json({
        error: 'Erro ao atualizar relacionamento',
        details: err.message
      });
    }
  },

  async deleteRelationship(req, res) {
    const { id, tipo, relId } = req.params;
    const permitido = [
      'amigos',
      'inimigos',
      'rivais',
      'interesses',
      'conhecidos'
    ];
    if (!permitido.includes(tipo)) {
      return res.status(400).json({ error: 'Tipo de relacionamento inválido' });
    }
    try {
      const [player] = await sql`
        SELECT ${sql(tipo)}
        FROM players
        WHERE id = ${id}
      `;
      let lista = player?.[tipo] ?? [];
      if (!Array.isArray(lista)) lista = [lista];
      lista = lista.map((r) =>
        typeof r === 'string' ? JSON.parse(r) : r
      );

      const idx = lista.findIndex((r) => r.id == relId);
      if (idx < 0) {
        return res.status(404).json({ error: 'Relacionamento não encontrado' });
      }

      lista.splice(idx, 1);

      const arrLiteral =
        '{' +
        lista
          .map((item) =>
            '"' + JSON.stringify(item).replace(/"/g, '\\"') + '"'
          )
          .join(',') +
        '}';

      await sql`
        UPDATE players
        SET ${sql(tipo)} = ${arrLiteral}::jsonb[]
        WHERE id = ${id}
      `;
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({
        error: 'Erro ao excluir relacionamento',
        details: err.message
      });
    }
  }
};
