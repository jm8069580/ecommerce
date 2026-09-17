"use client"

import { useState, useEffect, useMemo } from "react"
import { Save, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useConfigStore } from "@/stores/config-store"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminSettingsPage() {
  const { config, fetchConfig, updateConfig, loading, saving } = useConfigStore()

  const initialValues = useMemo(
    () =>
      config
        ? {
            appName: config.appName,
            currency: config.currency,
            freeShippingThreshold: String(config.freeShippingThreshold),
            taxRate: String(config.taxRate),
          }
        : null,
    [config]
  )

  const [appName, setAppName] = useState(initialValues?.appName ?? "")
  const [currency, setCurrency] = useState(initialValues?.currency ?? "usd")
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    initialValues?.freeShippingThreshold ?? "200"
  )
  const [taxRate, setTaxRate] = useState(initialValues?.taxRate ?? "0")
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleSave = async () => {
    setSaveError(null)
    try {
      await updateConfig({
        appName,
        currency,
        freeShippingThreshold: Number(freeShippingThreshold),
        taxRate: Number(taxRate),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Error al guardar")
    }
  }

  if (loading && !config) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Configuracion</h1>
        <p className="text-muted-foreground">
          Administra la configuracion de tu tienda
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="store">Tienda</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informacion de la Tienda</CardTitle>
              <CardDescription>
                Configura la informacion basica de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nombre de la tienda</Label>
                  <Input
                    id="storeName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Email de contacto</Label>
                  <Input id="storeEmail" type="email" defaultValue="info@basictechshop.com" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Telefono</Label>
                  <Input id="storePhone" defaultValue="+507 999 888 77" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Direccion</Label>
                  <Input id="storeAddress" defaultValue="Av. Tecnologia 123, Ciudad de Panama" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Descripcion</Label>
                <Input
                  id="storeDescription"
                  defaultValue="Tu tienda de tecnologia de confianza"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zona Horaria y Moneda</CardTitle>
              <CardDescription>
                Configura la zona horaria y moneda de tu tienda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Select defaultValue="america-panama">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-panama">America/Panama (GMT-5)</SelectItem>
                      <SelectItem value="america-bogota">America/Bogota (GMT-5)</SelectItem>
                      <SelectItem value="america-mexico">America/Mexico_City (GMT-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">Dolares ($)</SelectItem>
                      <SelectItem value="pen">Soles (S/)</SelectItem>
                      <SelectItem value="eur">Euros (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuracion de Productos</CardTitle>
              <CardDescription>
                Configura como se muestran los productos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mostrar productos agotados</p>
                  <p className="text-sm text-muted-foreground">
                    Los productos sin stock se mostraran como {"\"Agotado\""}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mostrar cantidad en stock</p>
                  <p className="text-sm text-muted-foreground">
                    Muestra cuantas unidades quedan disponibles
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Permitir resenas de productos</p>
                  <p className="text-sm text-muted-foreground">
                    Los clientes pueden dejar resenas en productos
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Envio e Impuestos</CardTitle>
              <CardDescription>
                Configura las opciones de envio e impuestos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Envio gratis desde (US$)</Label>
                  <Input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tasa de impuesto (0.07 = 7% ITBMS)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
              </div>
              {config && (
                <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                  Paises de envio permitidos: {config.shippingCountries.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones por Email</CardTitle>
              <CardDescription>
                Configura que notificaciones recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nuevos pedidos</p>
                  <p className="text-sm text-muted-foreground">
                    Recibe un email cuando hay un nuevo pedido
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pagos fallidos</p>
                  <p className="text-sm text-muted-foreground">
                    Notificacion cuando un pago falla
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Stock bajo</p>
                  <p className="text-sm text-muted-foreground">
                    Alerta cuando un producto tiene poco stock
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nuevos usuarios</p>
                  <p className="text-sm text-muted-foreground">
                    Notificacion cuando se registra un nuevo usuario
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Metodos de Pago</CardTitle>
              <CardDescription>
                Habilita o deshabilita metodos de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tarjetas de credito/debito</p>
                  <p className="text-sm text-muted-foreground">
                    Visa, Mastercard, American Express
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Transferencia bancaria</p>
                  <p className="text-sm text-muted-foreground">
                    Banco General, BAC Credomatic, Banistmo
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Billeteras digitales</p>
                  <p className="text-sm text-muted-foreground">
                    Nequi, PayPal
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pago contra entrega</p>
                  <p className="text-sm text-muted-foreground">
                    El cliente paga al recibir el producto
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saveError && (
          <p className="text-sm text-destructive">{saveError}</p>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Guardado
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
