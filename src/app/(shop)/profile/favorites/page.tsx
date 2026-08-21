"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "@/components/products/ProductCard"
import { useWishlistStore } from "@/stores/wishlist-store"
import { useAuthStore } from "@/stores/auth-store"

export default function FavoritesPage() {
  const { items, loading, fetchWishlist, removeFromWishlist, hydrated } =
    useWishlistStore()
  const { status } = useAuthStore()

  useEffect(() => {
    if (status === "authenticated") {
      fetchWishlist()
    }
  }, [status, fetchWishlist])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Mis Favoritos</h2>
        <p className="text-muted-foreground">
          Productos que has guardado
        </p>
      </div>

      {loading && !hydrated ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square animate-pulse bg-muted" />
              <CardContent className="p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold">No tienes favoritos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Guarda productos que te gusten para verlos luego
            </p>
            <Button asChild>
              <Link href="/products">Explorar Productos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "producto" : "productos"} guardados
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => items.forEach((item) => removeFromWishlist(item.id))}
            >
              Limpiar lista
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
