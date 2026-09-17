"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Download, Eye, MoreHorizontal, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminStore } from "@/stores/admin-store"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  PENDING: { label: "Pendiente", variant: "secondary", className: "" },
  CONFIRMED: { label: "Confirmado", variant: "default", className: "bg-green-600" },
  PROCESSING: { label: "Procesando", variant: "secondary", className: "" },
  SHIPPED: { label: "Enviado", variant: "default", className: "bg-blue-600" },
  DELIVERED: { label: "Entregado", variant: "default", className: "bg-green-600" },
  CANCELLED: { label: "Cancelado", variant: "destructive", className: "" },
}

const methodLabels: Record<string, string> = {
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  WALLET: "Billetera",
  CASH_ON_DELIVERY: "Contra entrega",
}

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const { orders, loading, fetchOrders } = useAdminStore()

  useEffect(() => {
    fetchOrders({ limit: 100 })
  }, [fetchOrders])

  const filteredPayments = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.stripeSessionId ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED" || o.status === "CONFIRMED")
    .reduce((sum, o) => sum + o.total, 0)

  const pendingAmount = orders
    .filter((o) => o.status === "PENDING")
    .reduce((sum, o) => sum + o.total, 0)

  const cancelledAmount = orders
    .filter((o) => o.status === "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0)

  const renderPaymentsTable = (paymentsList: typeof orders) => {
    if (loading && paymentsList.length === 0) {
      return (
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Transaccion</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Pedido</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      )
    }

    if (paymentsList.length === 0) {
      return (
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No hay transacciones</p>
        </CardContent>
      )
    }

    return (
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Transaccion</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Pedido</TableHead>
              <TableHead>Metodo</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentsList.map((order) => {
              const status = statusConfig[order.status] ?? statusConfig.PENDING
              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.stripeSessionId
                      ? order.stripeSessionId.slice(0, 16) + "..."
                      : "—"}
                  </TableCell>
                  <TableCell>{order.customer.name}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{methodLabels[order.paymentMethod] ?? order.paymentMethod}</TableCell>
                  <TableCell className="font-medium">
                    $ {order.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant} className={status.className}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-US")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        {order.status === "DELIVERED" && (
                          <DropdownMenuItem>
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Reembolsar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pagos</h1>
          <p className="text-muted-foreground">
            Administra los pagos y transacciones
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recibido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              $ {totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              $ {pendingAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              $ {cancelledAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por pedido, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="DELIVERED">Entregado</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>{renderPaymentsTable(filteredPayments)}</Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            {renderPaymentsTable(
              orders.filter((o) => o.status === "DELIVERED" || o.status === "CONFIRMED")
            )}
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            {renderPaymentsTable(orders.filter((o) => o.status === "PENDING"))}
          </Card>
        </TabsContent>

        <TabsContent value="cancelled">
          <Card>
            {renderPaymentsTable(orders.filter((o) => o.status === "CANCELLED"))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
