import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { appointments } from "@/types/schema";
import { eq, and } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const appointmentId = parseInt(params.id);

    const [updatedAppointment] = await db
      .update(appointments)
      .set(body)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.userId, parseInt(session.user.id))
        )
      )
      .returning();

    if (!updatedAppointment) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("[APPOINTMENT_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const appointmentId = parseInt(params.id);

    await db
      .delete(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.userId, parseInt(session.user.id))
        )
      );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[APPOINTMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
