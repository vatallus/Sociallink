import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { appointments } from "@/types/schema";
import { eq } from "drizzle-orm";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, parseInt(session.user.id)));

    return NextResponse.json(userAppointments);
  } catch (error) {
    console.error("[APPOINTMENTS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const appointment = await db
      .insert(appointments)
      .values({
        ...body,
        userId: parseInt(session.user.id),
      })
      .returning();

    return NextResponse.json(appointment[0]);
  } catch (error) {
    console.error("[APPOINTMENT_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
