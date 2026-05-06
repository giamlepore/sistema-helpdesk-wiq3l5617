import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Ticket } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const { user, signIn, signUp } = useAuth()
  const { toast } = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let res
    if (isLogin) {
      res = await signIn(email, password)
    } else {
      res = await signUp(email, password, name)
    }

    setLoading(false)

    if (res.error) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: getErrorMessage(res.error),
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex items-center gap-2 text-primary font-bold text-3xl">
        <Ticket className="h-8 w-8" />
        <span>Helpdesk Pro</span>
      </div>

      <Card className="w-full max-w-md shadow-elevation border-0">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">
            {isLogin ? 'Bem-vindo de volta' : 'Criar uma conta'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Entre com seu e-mail e senha para acessar os chamados'
              : 'Preencha os dados abaixo para se cadastrar como cliente'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground w-full"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
