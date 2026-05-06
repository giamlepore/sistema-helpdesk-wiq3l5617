migrate(
  (app) => {
    const tickets = new Collection({
      name: 'tickets',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'agent' || client = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'agent' || client = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'agent' || client = @request.auth.id)",
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['open', 'in_progress', 'resolved', 'closed'],
          maxSelect: 1,
        },
        {
          name: 'priority',
          type: 'select',
          values: ['low', 'medium', 'high', 'urgent'],
          maxSelect: 1,
        },
        { name: 'category', type: 'text' },
        {
          name: 'client',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'agent', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_tickets_status ON tickets (status)',
        'CREATE INDEX idx_tickets_client ON tickets (client)',
      ],
    })
    app.save(tickets)

    const messages = new Collection({
      name: 'messages',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: '@request.auth.id = sender',
      deleteRule: "@request.auth.role = 'admin'",
      fields: [
        {
          name: 'ticket',
          type: 'relation',
          collectionId: tickets.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'sender',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          required: true,
        },
        { name: 'content', type: 'text', required: true },
        { name: 'attachments', type: 'file', maxSelect: 5, maxSize: 5242880 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(messages)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('messages'))
    } catch (e) {}
    try {
      app.delete(app.findCollectionByNameOrId('tickets'))
    } catch (e) {}
  },
)
