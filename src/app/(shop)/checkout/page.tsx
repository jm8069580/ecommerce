"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Check, MapPin, CreditCard, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { OrderSummary } from "@/components/checkout/OrderSummary"
import { useCartStore } from "@/stores/cart-store"
import { useUserStore } from "@/stores/user-store"
import { useAuthStore } from "@/stores/auth-store"
import { api } from "@/lib/api"

const steps = [
  { id: 1, name: "Envio" },
  { id: 2, name: "Pago" },
  { id: 3, name: "Confirmar" },
]

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const items = useCartStore((state) => state.items)
  const { addresses, fetchAddresses } = useUserStore()
  const { user, status } = useAuthStore()

  useEffect(() => {
    if (status === "authenticated") {
      fetchAddresses()
    }
  }, [status, fetchAddresses])

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault)
      setSelectedAddressId(defaultAddr?.id ?? addresses[0].id)
    }
  }, [addresses, selectedAddressId])

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId)

  const handleNext = () => {
    if (currentStep === 1 && !selectedAddressId) return
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleConfirmAndPay = async () => {
    if (!user || items.length === 0) return
    setLoading(true)
    try {
      const data = await api.post<{ url: string | null }>("/checkout", {
        items: items.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images?.[0],
        })),
        customerEmail: user.email,
        shippingAddressId: selectedAddressId || undefined,
      })

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      alert("Error al procesar el pago. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold">Inicia sesion para continuar</h1>
          <p className="mt-2 text-muted-foreground">
            Necesitas una cuenta para finalizar tu compra.
          </p>
          <Button asChild className="mt-6">
            <Link href="/login?callbackUrl=/checkout">Iniciar Sesion</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Tu carrito esta vacio</h1>
          <p className="mt-2 text-muted-foreground">
            Agrega productos antes de continuar con el checkout.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Explorar Productos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="-ml-2 mb-4">
          <Link href="/cart">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver al Carrito
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`ml-2 hidden text-sm font-medium sm:block ${
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-12 sm:w-24 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card p-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Direccion de Envio</h2>

                {addresses.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <MapPin className="h-8 w-8 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        No tienes direcciones guardadas
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/profile/addresses/new">Agregar Direccion</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                    className="space-y-3"
                  >
                    {addresses.map((addr) => (
                      <div key={addr.id}>
                        <RadioGroupItem
                          value={addr.id}
                          id={addr.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={addr.id}
                          className="flex cursor-pointer items-start gap-4 rounded-lg border p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
                        >
                          <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{addr.label}</p>
                              {addr.isDefault && (
                                <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {addr.name}<br />
                              {addr.address}<br />
                              {addr.city}, {addr.state} {addr.zipCode}<br />
                              {addr.phone}
                            </p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                <Button asChild variant="outline" size="sm">
                  <Link href="/profile/addresses/new">
                    <MapPin className="mr-2 h-4 w-4" />
                    Agregar nueva direccion
                  </Link>
                </Button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Metodo de Pago</h2>
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Pago seguro con Stripe</p>
                      <p className="text-sm text-muted-foreground">
                        Seras redirigido a la pasarela de pago de Stripe para completar tu compra de forma segura.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground">
                  Acepta Visa, Mastercard, American Express. Los datos de tu tarjeta no se almacenan en nuestros servidores.
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Confirmar Pedido</h2>
                <p className="text-sm text-muted-foreground">
                  Por favor revisa los detalles de tu pedido antes de confirmar.
                </p>

                {selectedAddress && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <h3 className="font-medium">Direccion de Envio</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedAddress.name}<br />
                      {selectedAddress.address}<br />
                      {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}<br />
                      {selectedAddress.phone}
                    </p>
                  </div>
                )}

                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-medium">Metodo de Pago</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pago con tarjeta via Stripe
                  </p>
                </div>

                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-medium">Productos ({items.length})</h3>
                  <div className="mt-2 space-y-2">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span>S/ {(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Atras
              </Button>
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={currentStep === 1 && !selectedAddressId}
                >
                  Continuar
                </Button>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmAndPay}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Check className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar y Pagar"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <OrderSummary items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}
