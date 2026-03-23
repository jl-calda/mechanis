import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const type = searchParams.get("type");

  if (!userId) {
    return NextResponse.json([], { status: 400 });
  }

  const where: { userId: string; type?: string } = { userId };
  if (type) where.type = type;

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, name, type, data } = body;

  if (!userId || !name || !type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const project = await prisma.project.upsert({
    where: { userId_name: { userId, name } },
    update: { data, type, updatedAt: new Date() },
    create: { userId, name, type, data },
  });

  return NextResponse.json(project);
}
