import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/types/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, body.username));

    if (existingUser.length > 0) {
      return new NextResponse("Tên đăng nhập đã tồn tại", { status: 400 });
    }

    const hashedPassword = await hash(body.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        ...body,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
      });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[REGISTER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
