import { NextResponse } from "next/server";
import prisma from "~~/lib/prisma";

export async function POST(request: Request) {
  try {
    const { tableId, playerAddress, playerAvatar } = await request.json();

    // 检查桌子是否存在
    const table = await prisma.table.findUnique({
      where: { table_id: tableId },
    });

    if (!table) {
      return NextResponse.json({ error: "桌子不存在" }, { status: 404 });
    }

    // 检查桌子状态
    if (table.status !== "idle") {
      return NextResponse.json({ error: "游戏已经开始" }, { status: 400 });
    }

    // 检查玩家是否已经在其他桌子
    const existingTable = await prisma.table.findFirst({
      where: {
        OR: [
          { player_a_address: playerAddress },
          { player_b_address: playerAddress }
        ]
      }
    });

    if (existingTable) {
      return NextResponse.json({ error: "您已经在其他桌子中" }, { status: 400 });
    }

    // 更新桌子信息
    let updateData = {};
    if (!table.player_a_address) {
      updateData = {
        player_a_address: playerAddress,
        player_a_avatar: playerAvatar
      };
    } else if (!table.player_b_address) {
      updateData = {
        player_b_address: playerAddress,
        player_b_avatar: playerAvatar
      };
    } else {
      return NextResponse.json({ error: "桌子已满" }, { status: 400 });
    }

    const updatedTable = await prisma.table.update({
      where: { table_id: tableId },
      data: updateData
    });

    return NextResponse.json({ success: true, table: updatedTable });
  } catch (error) {
    console.error("加入桌子错误:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
} 