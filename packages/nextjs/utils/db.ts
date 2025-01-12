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
    // 先获取当前桌子状态
    const table = await prisma.table.findUnique({
      where: { table_id: tableId }
    });

    if (!table) {
      return { success: false, message: 'Table not found' };
    }

    // 更新桌子状态
    const updatedTable = await prisma.table.update({
      where: { table_id: tableId },
      data: {
        player_a_address: table.player_a_address === playerAddress ? null : table.player_a_address,
        player_b_address: table.player_b_address === playerAddress ? null : table.player_b_address,
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

// 保存玩家信息
export const savePlayerInfo = async (address: string): Promise<{
  message: string;
  player?: PlayerInfo;
}> => {
  try {
    // 首先检查玩家是否已存在
    const existingPlayer = await prisma.player.findUnique({
      where: { player_address: address }
    });

    if (existingPlayer) {
      logWithTime('Player already exists:', address);
      return { message: 'Player already exists', player: existingPlayer };
    }

    // 如果玩家不存在，创建新玩家记录
    const nickname = `Player_${address.slice(0, 6)}`;
    const newPlayer = await prisma.player.create({
      data: {
        player_address: address,
        avatar: '',
        nickname,
        total_games: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        win_rate: 0,
        ranking: null,
      }
    });

    logWithTime('New player created:', newPlayer);
    return { message: 'Player created successfully', player: newPlayer };
  } catch (error) {
    errorWithTime('DB Error:', error);
    throw new Error('Failed to save player info');
  }
}; 