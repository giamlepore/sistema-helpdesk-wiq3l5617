import pb from '@/lib/pocketbase/client'

export const getTickets = async () => {
  return pb.collection('tickets').getFullList({
    sort: '-created',
    expand: 'client,agent',
  })
}

export const getTicket = async (id: string) => {
  return pb.collection('tickets').getOne(id, {
    expand: 'client,agent',
  })
}

export const createTicket = async (data: Partial<any>) => {
  return pb.collection('tickets').create(data)
}

export const updateTicket = async (id: string, data: Partial<any>) => {
  return pb.collection('tickets').update(id, data)
}

export const getMessages = async (ticketId: string) => {
  return pb.collection('messages').getFullList({
    filter: `ticket="${ticketId}"`,
    sort: 'created',
    expand: 'sender',
  })
}

export const createMessage = async (
  ticketId: string,
  senderId: string,
  content: string,
  files?: FileList | null,
) => {
  const formData = new FormData()
  formData.append('ticket', ticketId)
  formData.append('sender', senderId)
  formData.append('content', content)

  if (files) {
    for (let i = 0; i < files.length; i++) {
      formData.append('attachments', files[i])
    }
  }

  return pb.collection('messages').create(formData)
}

export const getUsers = async (role?: string) => {
  const filter = role ? `role="${role}"` : ''
  return pb.collection('users').getFullList({ filter })
}
