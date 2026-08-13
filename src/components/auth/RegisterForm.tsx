"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useAuthStore } from "@/stores/auth-store"

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const register = useAuthStore((state) => state.register)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setError(null)

    try {
      await register(data.name, data.email, data.password)
      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar usuario")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Crear Cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para crear una nueva cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  {...registerField("name")}
                />
                {errors.name && (
                  <FieldError>{errors.name.message}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  {...registerField("email")}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      {...registerField("password")}
                    />
                    {errors.password && (
                      <FieldError>{errors.password.message}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirmar Contraseña
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...registerField("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                      <FieldError>{errors.confirmPassword.message}</FieldError>
                    )}
                  </Field>
                </Field>
                <FieldDescription>
                  Debe tener al menos 6 caracteres.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Iniciar Sesión
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Al continuar, aceptas nuestros{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          Términos de Servicio
        </Link>{" "}
        y{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          Política de Privacidad
        </Link>
        .
      </FieldDescription>
    </div>
  )
}
