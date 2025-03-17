import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming you have prisma setup here

// GET /api/users - Fetch all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        lastLogin: true, // Assuming you store last login in the user model
      },
    });
    
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}

// PATCH /api/users/[userId] - Update user role
export async function PATCH(req: Request) {
  const { userId } = req.url.split("/").pop()!; // Extracting userId from the URL

  try {
    const { role } = await req.json();

    if (!role || !["admin", "user"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { role },
    });

    return NextResponse.json({ message: "Role updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ message: "Error updating user role" }, { status: 500 });
  }
}
