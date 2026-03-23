import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json([], { status: 400 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("GET /api/favorites error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, designation, profileType, standard } = body;

    if (!userId || !designation || !profileType || !standard) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const favorite = await prisma.favorite.upsert({
      where: { userId_designation: { userId, designation } },
      update: {},
      create: { userId, designation, profileType, standard },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error("POST /api/favorites error:", error);
    return NextResponse.json(
      { error: "Failed to save favorite" },
      { status: 500 }
    );
  }
}
