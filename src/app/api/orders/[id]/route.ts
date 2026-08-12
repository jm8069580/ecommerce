import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireAdmin } from "@/lib/authorization"
import { orderStatusSchema } from "@/lib/validations"

type Params = Promise<{ id: string }>

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        address: true,
        items: {
          include: {
            product: {
              select: { images: true, slug: true },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Only the owner or an admin can view the order
    const isOwner = order.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.user.name,
        email: order.user.email,
      },
      status: order.status.toLowerCase(),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      shippingAddress: {
        name: order.address.name,
        phone: order.address.phone,
        address: order.address.address,
        city: order.address.city,
        state: order.address.state,
        zipCode: order.address.zipCode,
      },
      items: order.items.map((item) => ({
        productId: item.productId,
        slug: item.product.slug,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
        image: item.product.images[0] || "",
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { error: "Error fetching order" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const { id } = await params
    const body = orderStatusSchema.parse(await request.json())

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: body.status.toUpperCase() as
          | "PENDING"
          | "CONFIRMED"
          | "PROCESSING"
          | "SHIPPED"
          | "DELIVERED"
          | "CANCELLED",
        notes: body.notes,
      },
    })

    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      updatedAt: order.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Error updating order" },
      { status: 500 }
    )
  }
}