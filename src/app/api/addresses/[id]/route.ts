import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/authorization"
import { addressSchema } from "@/lib/validations"

type Params = Promise<{ id: string }>

async function getOwnedAddress(id: string, userId: string) {
  const address = await prisma.address.findUnique({
    where: { id },
  })

  if (!address || address.userId !== userId) {
    return null
  }

  return address
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const address = await getOwnedAddress(id, session.user.id!)

    if (!address) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: address.id,
      label: address.label,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    })
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json(
      { error: "Error fetching address" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const body = addressSchema.parse(await request.json())
    const userId = session.user.id!

    const existing = await getOwnedAddress(id, userId)
    if (!existing) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      )
    }

    // If setting as default, unset other defaults
    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        label: body.label,
        name: body.name,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        isDefault: body.isDefault,
      },
    })

    return NextResponse.json({
      id: address.id,
      label: address.label,
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: address.isDefault,
    })
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json(
      { error: "Error updating address" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const existing = await getOwnedAddress(id, session.user.id!)

    if (!existing) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      )
    }

    await prisma.address.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      { error: "Error deleting address" },
      { status: 500 }
    )
  }
}