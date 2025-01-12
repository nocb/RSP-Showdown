import prisma from '../lib/prisma';
import { logWithTime, errorWithTime } from './logger';
import type { Table, Player, Game } from '@prisma/client';

export type TableInfo = Table;
export type PlayerInfo = Player;
export type GameInfo = Game;

// 获取所有桌子
export const getTables = async (): Promise<TableInfo[]> => {
  try {
    logWithTime('DB: Fetching all tables...');
    const tables = await prisma.table.findMany({
      orderBy: { table_id: 'asc' }
    });
    logWithTime('DB: Tables fetched:', tables);
    return tables;
  } catch (error) {
    errorWithTime('DB Error:', error);
    throw new Error('Failed to fetch table data');
  }
};

// 获取单个桌子
export const getTableById = async (tableId: number): Promise<TableInfo | null> => {
  try {
    logWithTime(`DB: Fetching table by ID: ${tableId}`);
    const table = await prisma.table.findUnique({
      where: { table_id: tableId }
    });
    logWithTime('DB: Table fetched:', table);
    return table;
  } catch (error) {
    errorWithTime('DB Error:', error);
    throw new Error('Failed to fetch table data');
  }
};

// 玩家加入桌子
export const joinTable = async (tableId: number, playerAddress: string): Promise<{
  success: boolean;
  message: string;
  table?: TableInfo;
}> => {
  try {
    // 检查桌子状态
    const table = await prisma.table.findUnique({
      where: { table_id: tableId }
    });

    if (!table) {
      return { success: false, message: 'Table not found' };
    }

    if (table.status === 'in_use') {
      return { success: false, message: 'Table is in use' };
    }

    // 更新桌子
    const updatedTable = await prisma.table.update({
      where: { table_id: tableId },
      data: {
        ...(table.player_a_address === null 
          ? { player_a_address: playerAddress }
          : { player_b_address: playerAddress }
        ),
        status: table.player_a_address === null ? 'idle' : 'in_use'
      }
    });

    return {
      success: true,
      message: 'Successfully joined table',
      table: updatedTable
    };
  } catch (error) {
    errorWithTime('DB Error:', error);
    throw new Error('Failed to join table');
  }
};

// 玩家退出桌子
export const leaveTable = async (tableId: number, playerAddress: string): Promise<{
  success: boolean;
  message: string;
  table?: TableInfo;
}> => {
  try {
    const updatedTable = await prisma.table.update({
      where: { table_id: tableId },
      data: {
        player_a_address: {
          set: prisma.table.fields.player_a_address === playerAddress ? null : undefined
        },
        player_b_address: {
          set: prisma.table.fields.player_b_address === playerAddress ? null : undefined
        },
        status: 'idle'
      }
    });

    return {
      success: true,
      message: 'Successfully left table',
      table: updatedTable
    };
  } catch (error) {
    errorWithTime('DB Error:', error);
    throw new Error('Failed to leave table');
  }
}; 