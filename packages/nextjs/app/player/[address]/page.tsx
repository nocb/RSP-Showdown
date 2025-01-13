"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface PlayerInfo {
  player_address: string;
  avatar: string | null;
  nickname: string | null;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  ranking: number | null;
}

interface GameRecord {
  game_id: number;
  player_a_address: string;
  player_b_address: string;
  winner_address: string | null;
  created_at: string;
  // 添加玩家选择的牌型
  player_a_choice: string;
  player_b_choice: string;
}

const PlayerPage = () => {
  const params = useParams();
  const address = params.address as string;
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo | null>(null);
  const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取玩家信息和对局记录
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        // 获取玩家信息
        const playerResponse = await fetch(`/api/players/${address}`);
        if (!playerResponse.ok) {
          throw new Error('Failed to fetch player info');
        }
        const playerData = await playerResponse.json();
        setPlayerInfo(playerData);

        // 获取对局记录 - 即使失败也不抛出错误
        try {
          const gamesResponse = await fetch(`/api/players/${address}/games`);
          if (gamesResponse.ok) {
            const gamesData = await gamesResponse.json();
            setGameRecords(gamesData);
          }
        } catch (err) {
          console.error("获取对局记录失败:", err);
          // 对局记录获取失败时，保持空数组
          setGameRecords([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [address]);

  // 获取对局结果文本
  const getGameResult = (game: GameRecord) => {
    if (game.winner_address === address) return "赢";
    if (game.winner_address === null) return "平";
    return "输";
  };

  // 获取对手地址
  const getOpponentAddress = (game: GameRecord) => {
    return game.player_a_address === address ? game.player_b_address : game.player_a_address;
  };

  // 获取玩家在该局使用的牌
  const getPlayerChoice = (game: GameRecord) => {
    return game.player_a_address === address ? game.player_a_choice : game.player_b_choice;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error || !playerInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Player not found'}</p>
          <Link href="/" className="btn btn-outline">
            返回大厅
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 玩家基本信息 */}
      <div className="bg-base-200 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">玩家信息</h2>
        <div className="flex flex-col items-center gap-4">
          <Image
            src={playerInfo.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${address}`}
            alt="玩家头像"
            width={100}
            height={100}
            className="rounded-full border-4 border-primary"
          />
          <div className="text-lg font-medium">
            玩家地址：{address}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold">{playerInfo.total_games}</div>
              <div className="text-sm opacity-80">对局数</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-500">{playerInfo.wins}</div>
              <div className="text-sm opacity-80">赢</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-500">{playerInfo.losses}</div>
              <div className="text-sm opacity-80">输</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{playerInfo.draws}</div>
              <div className="text-sm opacity-80">平</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{(playerInfo.win_rate * 100).toFixed(1)}%</div>
              <div className="text-sm opacity-80">胜率</div>
            </div>
          </div>
        </div>
      </div>

      {/* 对局记录 */}
      <div className="bg-base-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">对局记录</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="text-center">
                <th>我的牌</th>
                <th>对局结果</th>
                <th>对手</th>
                <th>对手牌</th>
                <th>日期</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {gameRecords.map((game) => (
                <tr key={game.game_id} className="text-center">
                  <td>{getPlayerChoice(game)}</td>
                  <td>
                    <span className={`
                      font-bold
                      ${game.winner_address === address ? 'text-green-500' : ''}
                      ${game.winner_address === null ? 'text-yellow-500' : ''}
                      ${game.winner_address && game.winner_address !== address ? 'text-red-500' : ''}
                    `}>
                      {getGameResult(game)}
                    </span>
                  </td>
                  <td>{`${getOpponentAddress(game).slice(0, 6)}...${getOpponentAddress(game).slice(-4)}`}</td>
                  <td>{game.player_a_address === address ? game.player_b_choice : game.player_a_choice}</td>
                  <td>{new Date(game.created_at).toLocaleDateString()}</td>
                  <td>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage; 