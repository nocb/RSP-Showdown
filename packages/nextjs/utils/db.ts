import { sql } from '@vercel/postgres';

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

// 定义 rsp_game 的类型
export type GameInfo = {
  game_id: number;
  player_a_address: string;
  player_b_address: string;
  winner_address: string | null;
  created_at: Date;
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

// 移除 cache，修改获取桌子列表函数
export const getTables = async (): Promise<TableInfo[]> => {
  try {
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
    const tables: TableInfo[] = rows.map(row => ({
      table_id: Number(row.table_id),
      stake: Number(row.stake),
      player_a_avatar: row.player_a_avatar,
      player_a_address: row.player_a_address,
      player_b_avatar: row.player_b_avatar,
      player_b_address: row.player_b_address,
      status: row.status as 'idle' | 'in_use'
    }));

    console.log('getTables:', tables);
    return tables;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch table data');
  }
};

// 生成玩家头像的函数
const generateAvatarUrl = (address: string) => {
  return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}`;
};

// 保存玩家信息的函数
export const savePlayerInfo = async (address: string) => {
  try {
    // 首先检查玩家是否已存在
    const { rows: existingPlayer } = await sql`
      SELECT player_address FROM rsp_player 
      WHERE player_address = ${address};
    `;

    if (existingPlayer.length > 0) {
      console.log('Player already exists:', address);
      return { message: 'Player already exists' };
    }

    // 如果玩家不存在，创建新玩家记录
    const nickname = `Player_${address.slice(0, 6)}`;

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
        ' ',
        ${nickname},
        0,          -- total_games
        0,          -- wins
        0,          -- losses
        0,          -- draws
        0.00,       -- win_rate
        null,       -- ranking
        NOW()
      )
      RETURNING *;
    `;

    console.log('New player created:', newPlayer[0]);
    return newPlayer[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to save player info');
  }
};

// 移除 cache，修改获取单个桌子函数
export const getTableById = async (tableId: number): Promise<TableInfo | null> => {
  try {
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
      WHERE table_id = ${tableId};
    `;

    console.log('Fetched table by ID:', rows);

    if (rows.length === 0) {
      return null;
    }

    // 转换数据确保类型正确
    const table = {
      table_id: Number(rows[0].table_id),
      stake: Number(rows[0].stake),
      player_a_avatar: rows[0].player_a_avatar,
      player_a_address: rows[0].player_a_address,
      player_b_avatar: rows[0].player_b_avatar,
      player_b_address: rows[0].player_b_address,
      status: rows[0].status as 'idle' | 'in_use'
    };

    return table;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch table data');
  }
}; 

// 插入新桌子
export const createTable = async (stake: number): Promise<TableInfo> => {
  const { rows } = await sql`
    INSERT INTO rsp_table (stake, status)
    VALUES (${stake}, 'idle')
    RETURNING *;
  `;
  // 转换数据类型
  return {
    table_id: Number(rows[0].table_id),
    stake: Number(rows[0].stake),
    player_a_avatar: rows[0].player_a_avatar,
    player_a_address: rows[0].player_a_address,
    player_b_avatar: rows[0].player_b_avatar,
    player_b_address: rows[0].player_b_address,
    status: rows[0].status as 'idle' | 'in_use'
  };
};

// 获取所有桌子
export const getAllTables = async (): Promise<TableInfo[]> => {
  const { rows } = await sql`SELECT * FROM rsp_table;`;
  // 转换数据类型
  return rows.map(row => ({
    table_id: Number(row.table_id),
    stake: Number(row.stake),
    player_a_avatar: row.player_a_avatar,
    player_a_address: row.player_a_address,
    player_b_avatar: row.player_b_avatar,
    player_b_address: row.player_b_address,
    status: row.status as 'idle' | 'in_use'
  }));
};

// 更新桌子状态
export const updateTableStatus = async (tableId: number, status: 'idle' | 'in_use'): Promise<TableInfo> => {
  const { rows } = await sql`
    UPDATE rsp_table
    SET status = ${status}
    WHERE table_id = ${tableId}
    RETURNING *;
  `;
  // 转换数据类型
  return {
    table_id: Number(rows[0].table_id),
    stake: Number(rows[0].stake),
    player_a_avatar: rows[0].player_a_avatar,
    player_a_address: rows[0].player_a_address,
    player_b_avatar: rows[0].player_b_avatar,
    player_b_address: rows[0].player_b_address,
    status: rows[0].status as 'idle' | 'in_use'
  };
};

// 删除桌子
export const deleteTable = async (tableId: number): Promise<void> => {
  await sql`DELETE FROM rsp_table WHERE table_id = ${tableId};`;
};

// 插入新玩家
export const createPlayer = async (address: string, avatar: string, nickname: string): Promise<PlayerInfo> => {
  const { rows } = await sql`
    INSERT INTO rsp_player (player_address, avatar, nickname, total_games, wins, losses, draws, win_rate, ranking, created_at)
    VALUES (${address}, ${avatar}, ${nickname}, 0, 0, 0, 0, 0.00, null, NOW())
    RETURNING *;
  `;
  // 转换数据类型
  return {
    player_address: rows[0].player_address,
    avatar: rows[0].avatar,
    nickname: rows[0].nickname,
    created_at: rows[0].created_at,
    total_games: Number(rows[0].total_games),
    wins: Number(rows[0].wins),
    losses: Number(rows[0].losses),
    draws: Number(rows[0].draws),
    win_rate: Number(rows[0].win_rate),
    ranking: rows[0].ranking ? Number(rows[0].ranking) : null
  };
};

// 获取所有玩家
export const getAllPlayers = async (): Promise<PlayerInfo[]> => {
  const { rows } = await sql`SELECT * FROM rsp_player;`;
  // 转换数据类型
  return rows.map(row => ({
    player_address: row.player_address,
    avatar: row.avatar,
    nickname: row.nickname,
    created_at: row.created_at,
    total_games: Number(row.total_games),
    wins: Number(row.wins),
    losses: Number(row.losses),
    draws: Number(row.draws),
    win_rate: Number(row.win_rate),
    ranking: row.ranking ? Number(row.ranking) : null
  }));
};

// 更新玩家信息
export const updatePlayer = async (address: string, updates: Partial<PlayerInfo>): Promise<PlayerInfo> => {
  const { rows } = await sql`
    UPDATE rsp_player
    SET 
      avatar = COALESCE(${updates.avatar}, avatar),
      nickname = COALESCE(${updates.nickname}, nickname),
      total_games = COALESCE(${updates.total_games}, total_games),
      wins = COALESCE(${updates.wins}, wins),
      losses = COALESCE(${updates.losses}, losses),
      draws = COALESCE(${updates.draws}, draws),
      win_rate = COALESCE(${updates.win_rate}, win_rate),
      ranking = COALESCE(${updates.ranking}, ranking)
    WHERE player_address = ${address}
    RETURNING *;
  `;
  // 转换数据类型
  return {
    player_address: rows[0].player_address,
    avatar: rows[0].avatar,
    nickname: rows[0].nickname,
    created_at: rows[0].created_at,
    total_games: Number(rows[0].total_games),
    wins: Number(rows[0].wins),
    losses: Number(rows[0].losses),
    draws: Number(rows[0].draws),
    win_rate: Number(rows[0].win_rate),
    ranking: rows[0].ranking ? Number(rows[0].ranking) : null
  };
};

// 删除玩家
export const deletePlayer = async (address: string): Promise<void> => {
  await sql`DELETE FROM rsp_player WHERE player_address = ${address};`;
};

// 插入新游戏
export const createGame = async (playerA: string, playerB: string): Promise<GameInfo> => {
  const { rows } = await sql`
    INSERT INTO rsp_game (player_a_address, player_b_address, created_at)
    VALUES (${playerA}, ${playerB}, NOW())
    RETURNING *;
  `;
  return {
    game_id: Number(rows[0].game_id),
    player_a_address: rows[0].player_a_address,
    player_b_address: rows[0].player_b_address,
    winner_address: rows[0].winner_address,
    created_at: rows[0].created_at
  };
};

// 获取所有游戏
export const getAllGames = async (): Promise<GameInfo[]> => {
  const { rows } = await sql`SELECT * FROM rsp_game;`;
  return rows.map(row => ({
    game_id: row.game_id,
    player_a_address: row.player_a_address,
    player_b_address: row.player_b_address,
    created_at: row.created_at,
    winner_address: row.winner_address,
  }));
};

// 更新游戏结果
export const updateGameWinner = async (gameId: number, winnerAddress: string): Promise<GameInfo> => {
  const { rows } = await sql`
    UPDATE rsp_game
    SET winner_address = ${winnerAddress}
    WHERE game_id = ${gameId}
    RETURNING *;
  `;
  return rows[0] as GameInfo;
};

// 删除游戏
export const deleteGame = async (gameId: number): Promise<void> => {
  await sql`DELETE FROM rsp_game WHERE game_id = ${gameId};`;
};

// 检查玩家是否加入了某桌子
export const isPlayerInTable = async (tableId: number, playerAddress: string): Promise<boolean> => {
  try {
    const { rows } = await sql`
      SELECT * FROM rsp_table 
      WHERE table_id = ${tableId} 
      AND (player_a_address = ${playerAddress} OR player_b_address = ${playerAddress});
    `;
    return rows.length > 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check player in table');
  }
};

// 检查玩家是否能加入某桌子
export const canPlayerJoinTable = async (tableId: number, playerAddress: string): Promise<boolean> => {
  try {
    // 获取桌子信息
    const { rows: [table] } = await sql`
      SELECT * FROM rsp_table WHERE table_id = ${tableId}
    `;

    if (!table || table.status === 'in_use') {
      return false;
    }

    // 检查玩家是否已在其他桌子
    const playerTableId = await getPlayerTableId(playerAddress);
    if (playerTableId !== 0) {
      return false;
    }

    // 检查该桌子是否还有空位
    return !table.player_a_address || !table.player_b_address;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check if player can join table');
  }
};

// 获取玩家所在的桌子编号
export const getPlayerTableId = async (playerAddress: string): Promise<number> => {
  try {
    const { rows } = await sql`
      SELECT table_id FROM rsp_table 
      WHERE player_a_address = ${playerAddress} 
      OR player_b_address = ${playerAddress}
    `;
    return rows.length > 0 ? Number(rows[0].table_id) : 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to get player table');
  }
};

// 玩家加入桌子
export const joinTable = async (tableId: number, playerAddress: string): Promise<{
  success: boolean;
  message: string;
  table?: TableInfo;
}> => {
  try {
    // 检查是否能加入
    const canJoin = await canPlayerJoinTable(tableId, playerAddress);
    if (!canJoin) {
      return { success: false, message: 'Cannot join table' };
    }

    // 获取当前桌子状态
    const { rows: [table] } = await sql`
      SELECT * FROM rsp_table WHERE table_id = ${tableId}
    `;

    // 更新玩家位置
    let updateQuery;
    if (!table.player_a_address) {
      updateQuery = sql`
        UPDATE rsp_table 
        SET player_a_address = ${playerAddress},
            status = CASE 
              WHEN player_b_address IS NOT NULL THEN 'in_use'
              ELSE 'idle'
            END
        WHERE table_id = ${tableId}
        RETURNING *;
      `;
    } else {
      updateQuery = sql`
        UPDATE rsp_table 
        SET player_b_address = ${playerAddress},
            status = 'in_use'
        WHERE table_id = ${tableId}
        RETURNING *;
      `;
    }

    const { rows: [updatedTable] } = await updateQuery;
    return { 
      success: true, 
      message: 'Successfully joined table',
      table: {
        table_id: Number(updatedTable.table_id),
        stake: Number(updatedTable.stake),
        player_a_avatar: updatedTable.player_a_avatar,
        player_a_address: updatedTable.player_a_address,
        player_b_avatar: updatedTable.player_b_avatar,
        player_b_address: updatedTable.player_b_address,
        status: updatedTable.status as 'idle' | 'in_use'
      }
    };
  } catch (error) {
    console.error('Database Error:', error);
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
    // 检查是否在桌子中
    const isInTable = await isPlayerInTable(tableId, playerAddress);
    if (!isInTable) {
      return { success: false, message: 'Player not in table' };
    }

    // 更新桌子状态
    const { rows: [updatedTable] } = await sql`
      UPDATE rsp_table 
      SET 
        player_a_address = CASE WHEN player_a_address = ${playerAddress} THEN null ELSE player_a_address END,
        player_b_address = CASE WHEN player_b_address = ${playerAddress} THEN null ELSE player_b_address END,
        status = 'idle'
      WHERE table_id = ${tableId}
      RETURNING *;
    `;

    return { 
      success: true, 
      message: 'Successfully left table',
      table: {
        table_id: Number(updatedTable.table_id),
        stake: Number(updatedTable.stake),
        player_a_avatar: updatedTable.player_a_avatar,
        player_a_address: updatedTable.player_a_address,
        player_b_avatar: updatedTable.player_b_avatar,
        player_b_address: updatedTable.player_b_address,
        status: updatedTable.status as 'idle' | 'in_use'
      }
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to leave table');
  }
}; 