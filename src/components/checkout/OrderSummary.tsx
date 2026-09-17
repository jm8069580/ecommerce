"use client"

import { useState } from "react"
import { Tag, X, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CartItem } from "@/types"
import { useCouponsStore } from "@/stores/coupons-store"
import { useConfigStore } from "@/stores/config-store"

interface OrderSummaryProps {
  items: CartItem[]
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("")
  const { appliedCode, discount, validating, error, validateCoupon, clearCoupon } =
    useCouponsStore()
  const freeShippingThreshold = useConfigStore(
    (state) => state.config?.freeShippingThreshold ?? 200
  )

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  )
  const shipping = subtotal >= freeShippingThreshold ? 0 : 15
  const total = subtotal + shipping - discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    await validateCoupon(couponCode.trim(), subtotal)
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Resumen del Pedido</h2>

      {/* Items */}
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-3">
            <div className="flex-1 flex flex-col">
              <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.quantity}x $ {item.product.price.toFixed(2)}
              </p>
            </div>
            <p className="text-sm font-medium">
              $ {(item.product.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Coupon */}
      <div className="space-y-2">
        {appliedCode ? (
          <div className="flex items-center justify-between rounded-md bg-green-50 dark:bg-green-950/20 px-3 py-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">{appliedCode}</span>
              <span className="text-sm text-green-600">
                -$ {discount.toFixed(2)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearCoupon}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Codigo de cupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="h-9 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleApplyCoupon()
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyCoupon}
              disabled={validating || !couponCode.trim()}
            >
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
        {error && !appliedCode && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>

      <Separator className="my-4" />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>$ {subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Descuento</span>
            <span>-$ {discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Envio</span>
          <span>{shipping === 0 ? "Gratis" : `$ ${shipping.toFixed(2)}`}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span className="text-lg text-primary">$ {total.toFixed(2)}</span>
      </div>
    </div>
  )
}
