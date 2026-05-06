import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { createTicket } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function NewTicket() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    priority: 'low',
    description: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const ticket = await createTicket({
        ...formData,
        client: user.id,
        status: 'open',
      })

      toast({
        title: 'Chamado Criado',
        description: 'Seu chamado foi criado e está na fila de atendimento.',
      })
      navigate(`/tickets/${ticket.id}`)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar chamado',
        description: getErrorMessage(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0 hover:bg-transparent">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <Card className="border-0 shadow-elevation">
        <CardHeader>
          <CardTitle className="text-2xl">Novo Chamado</CardTitle>
          <CardDescription>
            Preencha os detalhes abaixo para que possamos ajudá-lo rapidamente.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Assunto</Label>
              <Input
                id="title"
                placeholder="Descreva brevemente o problema"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => handleChange('category', v)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Técnico">Problema Técnico</SelectItem>
                    <SelectItem value="Financeiro">Faturamento / Financeiro</SelectItem>
                    <SelectItem value="Dúvida">Dúvida de Uso</SelectItem>
                    <SelectItem value="Geral">Assunto Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => handleChange('priority', v)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Detalhada</Label>
              <Textarea
                id="description"
                placeholder="Explique com detalhes o que está acontecendo..."
                className="min-h-[150px] resize-none"
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 pt-6 rounded-b-lg flex justify-end">
            <Button type="submit" disabled={loading} size="lg">
              {loading ? 'Criando...' : 'Abrir Chamado'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
