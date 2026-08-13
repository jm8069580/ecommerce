"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Package, MapPin, Heart, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/stores/auth-store"

const navigation = [
  { name: "Mi Perfil", href: "/profile", icon: User },
  { name: "Mis Pedidos", href: "/profile/orders", icon: Package },
  { name: "Direcciones", href: "/profile/addresses", icon: MapPin },
  { name: "Favoritos", href: "/profile/favorites", icon: Heart },
  { name: "Configuracion", href: "/profile/settings", icon: Settings },
]

export function ProfileSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const name = user?.name || "Usuario"
  const initials =
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

  return (
    <aside className="space-y-6">
      {/* User Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground hover:text-destructive"
        onClick={() => logout()}
      >
        <LogOut className="mr-3 h-4 w-4" />
        Cerrar Sesion
      </Button>
    </aside>
  )
}
