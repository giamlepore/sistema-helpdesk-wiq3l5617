import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTicket, getMessages, createMessage, updateTicket } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge, PriorityBadge } from '@/components/ui/TicketBadge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Send, Paperclip } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [ticket, setTicket] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadData = async () => {
    if (!id) return
    try {
      const t = await getTicket(id)
      setTicket(t)
      const m = await getMessages(id)
      setMessages(m)
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar o chamado.',
      })
      navigate('/tickets')
    }
  }

  useEffect(() => {
    loadData()
  }, [id])
  useRealtime('tickets', (e) => {
    if (e.record.id === id) loadData()
  })
  useRealtime('messages', (e) => {
    if (e.record.ticket === id) loadData()
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !id) return
    setSending(true)
    try {
      await createMessage(id, user.id, newMessage)
      setNewMessage('')
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao enviar mensagem.' })
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return
    try {
      await updateTicket(id, { status: newStatus })
      toast({ title: 'Sucesso', description: 'Status atualizado com sucesso.' })
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao atualizar status.' })
    }
  }

  if (!ticket) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>

  const isAdminOrAgent = user.role === 'admin' || user.role === 'agent'

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{ticket.title}</h1>
          <p className="text-sm text-muted-foreground">
            #{ticket.id} • Criado em {format(new Date(ticket.created), 'dd/MM/yyyy HH:mm')}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 flex flex-col bg-card border rounded-xl overflow-hidden shadow-subtle">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              {/* Ticket Original Description */}
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?seed=${ticket.client}`}
                  />
                  <AvatarFallback>{ticket.expand?.client?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-sm">{ticket.expand?.client?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(ticket.created), 'HH:mm')}
                    </span>
                  </div>
                  <div className="bg-muted p-4 rounded-lg rounded-tl-none text-sm whitespace-pre-wrap">
                    {ticket.description}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Messages */}
              {messages.map((msg) => {
                const isMe = msg.sender === user.id
                return (
                  <div
                    key={msg.id}
                    className={cn('flex gap-4', isMe ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <Avatar>
                      <AvatarImage
                        src={`https://img.usecurling.com/ppl/thumbnail?seed=${msg.sender}`}
                      />
                      <AvatarFallback>{msg.expand?.sender?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'flex-1 space-y-2 max-w-[85%]',
                        isMe ? 'text-right' : 'text-left',
                      )}
                    >
                      <div
                        className={cn(
                          'flex items-baseline gap-2',
                          isMe ? 'flex-row-reverse' : 'flex-row',
                        )}
                      >
                        <span className="font-semibold text-sm">{msg.expand?.sender?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(msg.created), 'HH:mm')}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'inline-block p-4 rounded-lg text-sm whitespace-pre-wrap text-left',
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted rounded-tl-none',
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/10">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                type="button"
                title="Anexar arquivo"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Textarea
                placeholder="Digite sua mensagem..."
                className="resize-none min-h-[60px] focus-visible:ring-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
              />
              <Button
                size="icon"
                className="shrink-0 h-auto self-stretch"
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              Pressione Enter para enviar, Shift+Enter para nova linha
            </p>
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto pb-4">
          <Card className="border-0 shadow-subtle">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                {isAdminOrAgent ? (
                  <Select value={ticket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1">
                    <StatusBadge status={ticket.status} />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Prioridade</Label>
                <div className="mt-1">
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Categoria</Label>
                <p className="text-sm font-medium">{ticket.category || 'Geral'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-subtle">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-semibold">Pessoas</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Cliente</Label>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://img.usecurling.com/ppl/thumbnail?seed=${ticket.client}`}
                    />
                    <AvatarFallback>{ticket.expand?.client?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm font-medium truncate">{ticket.expand?.client?.name}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Agente Atribuído</Label>
                {ticket.expand?.agent ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://img.usecurling.com/ppl/thumbnail?seed=${ticket.agent}`}
                      />
                      <AvatarFallback>{ticket.expand?.agent?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium truncate">{ticket.expand?.agent?.name}</div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Não atribuído</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
