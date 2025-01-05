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
    console.log('Fetched tables:', rows);

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