import { NextResponse } from "next/server";
import prisma from "~~/lib/prisma";

export async function POST(request: Request) {
  try {
    const { tableId, playerAddress } = await request.json();

    // 检查桌子是否存在
    const table = await prisma.table.findUnique({
      where: { table_id: tableId },
    });

    if (!table) {
      return NextResponse.json({ error: "桌子不存在" }, { status: 404 });
    }

    // 验证玩家是否在该桌子中
    if (table.player_a_address !== playerAddress && table.player_b_address !== playerAddress) {
      return NextResponse.json({ error: "您不在这个桌子中" }, { status: 400 });
    }

    // 更新桌子信息
    const updateData = table.player_a_address === playerAddress
      ? { player_a_address: null, player_a_avatar: null }
      : { player_b_address: null, player_b_avatar: null };

    const updatedTable = await prisma.table.update({
      where: { table_id: tableId },
      data: updateData
    });

    return NextResponse.json({ success: true, table: updatedTable });
  } catch (error) {
    console.error("退出桌子错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
} 