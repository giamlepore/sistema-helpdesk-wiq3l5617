import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { getTickets } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ticket, CheckCircle2, Clock, Activity, Plus } from 'lucide-react'
import { format, subDays, isAfter } from 'date-fns'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'
import { StatusBadge, PriorityBadge } from '@/components/ui/TicketBadge'

export default function Index() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<any[]>([])

  const loadData = async () => {
    try {
      const data = await getTickets()
      setTickets(data)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('tickets', () => loadData())

  const stats = useMemo(() => {
    const total = tickets.length
    const open = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length
    const resolved = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length
    return { total, open, resolved }
  }, [tickets])

  const lineChartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i)
      return format(d, 'yyyy-MM-dd')
    })

    return last7Days.map((dateStr) => {
      const created = tickets.filter((t) => t.created.startsWith(dateStr)).length
      const resolved = tickets.filter(
        (t) => t.updated.startsWith(dateStr) && (t.status === 'resolved' || t.status === 'closed'),
      ).length
      return { date: format(new Date(dateStr), 'dd/MM'), Criados: created, Resolvidos: resolved }
    })
  }, [tickets])

  const pieChartData = useMemo(() => {
    const counts: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 }
    tickets.forEach((t) => counts[t.priority]++)
    return [
      { name: 'Baixa', value: counts.low, fill: 'var(--color-low)' },
      { name: 'Média', value: counts.medium, fill: 'var(--color-medium)' },
      { name: 'Alta', value: counts.high, fill: 'var(--color-high)' },
      { name: 'Urgente', value: counts.urgent, fill: 'var(--color-urgent)' },
    ].filter((i) => i.value > 0)
  }, [tickets])

  const chartConfig = {
    Criados: { color: 'hsl(var(--primary))', label: 'Criados' },
    Resolvidos: { color: 'hsl(var(--chart-2))', label: 'Resolvidos' },
    low: { color: 'hsl(var(--muted-foreground))', label: 'Baixa' },
    medium: { color: 'hsl(var(--chart-2))', label: 'Média' },
    high: { color: 'hsl(var(--chart-4))', label: 'Alta' },
    urgent: { color: 'hsl(var(--destructive))', label: 'Urgente' },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo(a), {user.name}. Aqui está o resumo dos seus chamados.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-md">
          <Link to="/tickets/new">
            <Plus className="mr-2 h-5 w-5" />
            Novo Chamado
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Chamados
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chamados Abertos
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chamados Resolvidos
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              TMA (Estimado)
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 hrs</div>
          </CardContent>
        </Card>
      </div>

      {user.role !== 'client' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-subtle col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Atividade (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart
                  data={lineChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="Criados"
                    stroke="var(--color-Criados)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Resolvidos"
                    stroke="var(--color-Resolvidos)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-subtle col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-0 shadow-subtle">
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
              >
                <div>
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {ticket.title}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ticket.expand?.client?.name} •{' '}
                    {format(new Date(ticket.updated), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} className="hidden sm:inline-flex" />
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <p className="text-muted-foreground text-center py-4">Nenhum chamado encontrado.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
