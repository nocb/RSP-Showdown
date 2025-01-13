import { NextResponse } from "next/server";
import prisma from "~~/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const normalizedAddress = params.address.toLowerCase();

    const games = await prisma.game.findMany({
      where: {
        OR: [
          { player_a_address: normalizedAddress },
          { player_b_address: normalizedAddress }
        ]
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json(games);
  } catch (error) {
    console.error("获取对局记录错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
} 