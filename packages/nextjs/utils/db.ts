import { sql } from '@vercel/postgres';
import { cache } from 'react';

console.log('Database URL configured:', !!process.env.POSTGRES_URL);

export type TableInfo = {
  table_id: number;
  stake: number;
  player_a_avatar: string | null;
  player_a_address: string | null;
  player_b_avatar: string | null;
  player_b_address: string | null;
  status: 'idle' | 'in_use';
};

// 添加一个新的类型定义
export type PlayerInfo = {
  player_address: string;
  avatar: string;
  nickname: string | null;
  created_at?: Date;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  ranking: number | null;
};

// 添加一个测试连接的函数
export const testDatabaseConnection = async () => {
  try {
    const { rows } = await sql`SELECT NOW();`;
    console.log('Database connection successful:', rows);
    
    // 测试表是否存在并有数据
    const { rows: tableCount } = await sql`
      SELECT COUNT(*) as count FROM rsp_table;
    `;
    console.log('Table count:', tableCount[0].count);
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// 使用 cache 包装查询函数以启用 React 缓存
export const getTables = cache(async (): Promise<TableInfo[]> => {
  try {
    await testDatabaseConnection();
    
    // 使用 AS 关键字明确指定列名
    console.log('Fetching tables from database...');
    const { rows } = await sql`
      SELECT 
        table_id, 
        stake::integer as stake, 
        player_a_avatar,
        player_a_address,
        player_b_avatar,
        player_b_address,
        status
      FROM rsp_table
      ORDER BY table_id ASC;
    `;
    // console.log('Fetched tables:', rows);

    // 转换数据确保类型正确
    const tables = rows.map(row => ({
      table_id: Number(row.table_id),
      stake: Number(row.stake),
      player_a_avatar: row.player_a_avatar,
      player_a_address: row.player_a_address,
      player_b_avatar: row.player_b_avatar,
      player_b_address: row.player_b_address,
      status: row.status as 'idle' | 'in_use'
    }));

    return tables;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch table data');
  }
});

// 生成玩家头像的函数（使用地址生成独特的头像URL）
const generateAvatarUrl = (address: string) => {
  // 这里使用 dicebear 服务生成头像
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`;
};

// 保存或更新玩家信息
export const savePlayerInfo = cache(async (address: string): Promise<PlayerInfo> => {
  try {
    // 首先检查玩家是否已存在
    const { rows: existingPlayer } = await sql`
      SELECT * FROM rsp_player 
      WHERE player_address = ${address};
    `;

    if (existingPlayer.length > 0) {
      console.log('Player already exists:', existingPlayer[0]);
      return existingPlayer[0] as PlayerInfo;
    }

    // 如果玩家不存在，创建新玩家记录
    const avatar = generateAvatarUrl(address);
    const { rows: newPlayer } = await sql`
      INSERT INTO rsp_player (
        player_address,
        avatar,
        nickname,
        total_games,
        wins,
        losses,
        draws,
        win_rate,
        ranking,
        created_at
      ) VALUES (
        ${address},
        ${avatar},
        ${address.slice(0, 6)}, -- 使用地址前6位作为默认昵称
        0,                      -- total_games
        0,                      -- wins
        0,                      -- losses
        0,                      -- draws
        0.00,                   -- win_rate
        null,                   -- ranking
        NOW()
      )
      RETURNING *;
    `;

    console.log('New player created:', newPlayer[0]);
    return newPlayer[0] as PlayerInfo;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to save player info');
  }
}); 