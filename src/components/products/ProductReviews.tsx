"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare, Trash2, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useReviewsStore } from "@/stores/reviews-store"
import { useAuthStore } from "@/stores/auth-store"

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const {
    reviews,
    summary,
    loading,
    fetchReviews,
    fetchSummary,
    createReview,
    deleteReview,
  } = useReviewsStore()
  const { user, status } = useAuthStore()

  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews(productId)
    fetchSummary(productId)
  }, [productId, fetchReviews, fetchSummary])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      await createReview(productId, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      })
      setTitle("")
      setComment("")
      setRating(5)
      setShowForm(false)
      await Promise.all([fetchReviews(productId), fetchSummary(productId)])
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Error al enviar la reseña"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteReview(productId)
      await Promise.all([fetchReviews(productId), fetchSummary(productId)])
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }

  const userReview = reviews.find((r) => r.user.id === user?.id)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Average */}
            <div className="flex flex-col items-center sm:w-48">
              <span className="text-4xl font-bold">
                {summary?.averageRating.toFixed(1) ?? "0.0"}
              </span>
              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(summary?.averageRating ?? 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="mt-1 text-sm text-muted-foreground">
                {summary?.totalReviews ?? 0} reseñas
              </span>
            </div>

            {/* Distribution */}
            <div className="flex-1 space-y-1.5">
              {summary?.distribution.map((d) => (
                <div key={d.rating} className="flex items-center gap-2">
                  <span className="flex w-12 items-center gap-0.5 text-xs text-muted-foreground">
                    {d.rating}
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-yellow-400"
                      style={{
                        width: `${
                          summary.totalReviews > 0
                            ? (d.count / summary.totalReviews) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-xs text-muted-foreground">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review */}
      {status === "authenticated" && !userReview && (
        <div>
          {!showForm ? (
            <Button variant="outline" onClick={() => setShowForm(true)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Escribir una reseña
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tu reseña</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Rating */}
                  <div className="space-y-2">
                    <Label>Calificacion</Label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="rounded p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="review-title">Titulo (opcional)</Label>
                    <Input
                      id="review-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Resumen de tu opinion"
                      maxLength={100}
                    />
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <Label htmlFor="review-comment">Comentario (opcional)</Label>
                    <Textarea
                      id="review-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Cuenta tu experiencia con el producto"
                      rows={4}
                      maxLength={500}
                    />
                  </div>

                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Publicar
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* User's own review */}
      {userReview && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tu reseña</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Eliminar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < userReview.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            {userReview.title && (
              <p className="mt-2 font-medium">{userReview.title}</p>
            )}
            {userReview.comment && (
              <p className="mt-1 text-sm text-muted-foreground">
                {userReview.comment}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(userReview.createdAt).toLocaleDateString("es-PA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Reseñas ({reviews.length})
        </h3>

        {loading && reviews.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
                  <div className="mt-3 h-16 w-full animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.filter((r) => r.user.id !== user?.id).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Aun no hay reseñas. ¡Sé el primero en opinar!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews
            .filter((r) => r.user.id !== user?.id)
            .map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{review.user.name}</p>
                      <div className="mt-1 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("es-PA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {review.title && (
                    <p className="mt-3 font-medium">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}
