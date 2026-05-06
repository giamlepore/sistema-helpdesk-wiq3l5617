migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const ensureUser = (email, name, role) => {
      try {
        return app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        const record = new Record(users)
        record.setEmail(email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', name)
        record.set('role', role)
        app.save(record)
        return record
      }
    }

    const adminRecord = ensureUser('patric.martins@adapta.org', 'Admin Patric', 'admin')
    const agentRecord = ensureUser('agent@adapta.org', 'Suporte Agent', 'agent')
    const clientRecord = ensureUser('client@adapta.org', 'Cliente Teste', 'client')

    const tickets = app.findCollectionByNameOrId('tickets')
    const messages = app.findCollectionByNameOrId('messages')

    if (app.countRecords('tickets') === 0) {
      const t1 = new Record(tickets)
      t1.set('title', 'Sistema não carrega')
      t1.set('description', 'Ao tentar logar, a tela fica branca.')
      t1.set('status', 'open')
      t1.set('priority', 'high')
      t1.set('category', 'Técnico')
      t1.set('client', clientRecord.id)
      app.save(t1)

      const t2 = new Record(tickets)
      t2.set('title', 'Dúvida sobre faturamento')
      t2.set('description', 'Gostaria de saber quando vence a fatura.')
      t2.set('status', 'in_progress')
      t2.set('priority', 'medium')
      t2.set('category', 'Financeiro')
      t2.set('client', clientRecord.id)
      t2.set('agent', agentRecord.id)
      app.save(t2)

      const t3 = new Record(tickets)
      t3.set('title', 'Alterar senha')
      t3.set('description', 'Como mudo minha senha?')
      t3.set('status', 'resolved')
      t3.set('priority', 'low')
      t3.set('category', 'Geral')
      t3.set('client', clientRecord.id)
      t3.set('agent', adminRecord.id)
      app.save(t3)

      const m1 = new Record(messages)
      m1.set('ticket', t2.id)
      m1.set('sender', clientRecord.id)
      m1.set('content', 'Bom dia, não encontrei a fatura.')
      app.save(m1)

      const m2 = new Record(messages)
      m2.set('ticket', t2.id)
      m2.set('sender', agentRecord.id)
      m2.set('content', 'Olá! A fatura vence dia 10. Enviamos para seu e-mail.')
      app.save(m2)
    }
  },
  (app) => {
    // Revert logic for seeds is usually empty or deletes the seeded records if possible
  },
)
