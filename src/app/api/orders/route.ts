import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/authorization"
import { orderCreateSchema } from "@/lib/validations"

export async function GET() {
  try {
    // Get authenticated user
    const { session, error } = await requireAuth()
    if (error) return error

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippingAddress: `${order.address.address}, ${order.address.city}`,
      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        brand: item.product.id, // Would need to join with brand
        price: Number(item.price),
        quantity: item.quantity,
        image: item.product.images[0] || "",
      })),
    }))

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const body = orderCreateSchema.parse(await request.json())
    const userId = session.user.id!

    // Verify the address belongs to the authenticated user
    const address = await prisma.address.findUnique({
      where: { id: body.addressId },
    })

    if (!address || address.userId !== userId) {
      return NextResponse.json(
        { error: "Dirección no encontrada" },
        { status: 404 }
      )
    }

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, "0")}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        subtotal: body.subtotal,
        shipping: body.shipping,
        total: body.total,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
        userId,
        addressId: body.addressId,
        items: {
          create: body.items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            productId: item.productId,
          })),
        },
      },
      include: {
        items: true,
        address: true,
      },
    })

    return NextResponse.json(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    )
  }
}
