import { NextResponse } from "next/server";
import prisma from "~~/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const player = await prisma.player.findUnique({
      where: { player_address: params.address },
    });

    if (!player) {
      return NextResponse.json({ error: "玩家不存在" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("获取玩家信息错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
} 