"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface RankingPlayer {
  rank: number;
  address: string;
  total_games: number;
  win_rate: number;
}

const RankingPage = () => {
  // 模拟数据
  const [players] = useState<RankingPlayer[]>([
    { rank: 1, address: "0x123...abc", total_games: 20, win_rate: 0.56 },
    { rank: 2, address: "0x456...def", total_games: 20, win_rate: 0.26 },
    { rank: 3, address: "0x789...ghi", total_games: 16, win_rate: 0.46 },
    // 添加更多模拟数据...
  ]);

  // 模拟总数据
  const totalGames = 32;
  const totalPlayers = 10;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 总览数据 */}
      <div className="bg-base-200 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">总览</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalGames}</div>
            <div className="text-base opacity-80">对局总数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totalPlayers}</div>
            <div className="text-base opacity-80">玩家人数</div>
          </div>
        </div>
      </div>

      {/* 排行榜 */}
      <div className="bg-base-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">排行榜</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="text-center">
                <th>名次</th>
                <th>玩家地址</th>
                <th>胜率</th>
                <th>对局数</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.address} className="text-center hover:bg-base-300">
                  <td>
                    <div className="flex items-center justify-center">
                      {player.rank <= 3 ? (
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold
                          ${player.rank === 1 ? 'bg-yellow-500' : ''}
                          ${player.rank === 2 ? 'bg-gray-400' : ''}
                          ${player.rank === 3 ? 'bg-yellow-700' : ''}
                        `}>
                          {player.rank}
                        </div>
                      ) : (
                        player.rank
                      )}
                    </div>
                  </td>
                  <td>
                    <Link 
                      href={`/player/${player.address}`}
                      className="flex items-center justify-center gap-2 hover:text-primary"
                    >
                      <Image
                        src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${player.address}`}
                        alt="玩家头像"
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      {player.address}
                    </Link>
                  </td>
                  <td>{(player.win_rate * 100).toFixed(1)}%</td>
                  <td>{player.total_games}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RankingPage; 