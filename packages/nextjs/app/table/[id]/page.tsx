"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { TableInfo } from "~~/utils/db";

// 定义游戏状态类型
type GameStatus = "waiting" | "selecting" | "selected" | "revealed";
type CardType = "rock" | "scissors" | "paper" | null;

const TablePage = () => {
  const params = useParams();
  const tableId = params.id;
  
  // 所有的 hooks 必须在顶层声明
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("selecting");
  const [selectedCard, setSelectedCard] = useState<CardType>(null);
  const [opponentSelected, setOpponentSelected] = useState(false);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isCardFaceUp, setIsCardFaceUp] = useState(true);

  // 卡牌数据
  const cards = [
    { type: "rock", name: "石头", emoji: "🪨" },
    { type: "scissors", name: "剪刀", emoji: "✂️" },
    { type: "paper", name: "布", emoji: "📄" },
  ] as const;

  // 获取桌子信息
  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        const response = await fetch(`/api/table/${tableId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch table info');
        }
        const data = await response.json();
        setTableInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTableInfo();
  }, [tableId]);

  // 获取游戏状态提示文本
  const getStatusText = () => {
    switch (gameStatus) {
      case "waiting":
        return "等待对手加入...";
      case "selecting":
        return "请选择你要出的牌";
      case "selected":
        return opponentSelected ? "双方都已出牌，可以开牌" : "等待对手出牌";
      case "revealed":
        return "游戏结束";
      default:
        return "";
    }
  };

  // 处理选择卡牌
  const handleSelectCard = (cardType: CardType) => {
    if (gameStatus !== "selecting") return;
    setSelectedCard(cardType);
    setIsSelectingCard(false);
  };

  // 处理出牌
  const handlePlay = () => {
    if (!selectedCard) return;
    setTimeout(() => {
      setGameStatus("selected");
      setHasPlayed(true);
      setIsCardFaceUp(false);
    }, 500);
  };

  // 处理开牌
  const handleReveal = () => {
    if (gameStatus !== "selected" || !opponentSelected) return;
    setGameStatus("revealed");
    setIsCardFaceUp(true);
  };

  // 显示加载状态
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // 显示错误状态
  if (error || !tableInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Table not found'}</p>
          <Link href="/" className="btn btn-outline">
            返回大厅
          </Link>
        </div>
      </div>
    );
  }

  // 渲染主界面
  return (
    <div className="flex flex-col items-center flex-grow pt-10">
      {/* 顶部操作区 */}
      <div className="absolute top-4 right-4">
        <button className="btn btn-outline">申请退出</button>
      </div>

      {/* 游戏状态提示 */}
      <div className="mb-8">
        <div className="alert alert-info">
          <span className="font-bold">{getStatusText()}</span>
        </div>
      </div>

      {/* 对战信息区域 */}
      <div className="w-full max-w-4xl px-8">
        <div className="bg-base-100 rounded-3xl border border-gradient p-8">
          {/* 上半部分：玩家信息 */}
          <div className="flex items-center justify-between mb-12">
            {/* 对手信息 */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm opacity-80">
                {tableInfo.player_a_address ? 
                  `${tableInfo.player_a_address.slice(0, 6)}...${tableInfo.player_a_address.slice(-4)}` : 
                  '等待加入'
                }
              </span>
              {tableInfo.player_a_address ? (
                <Image
                  src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${tableInfo.player_a_address}`}
                  alt="玩家A头像"
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-base-300"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center">
                  <span className="text-2xl opacity-30">?</span>
                </div>
              )}
            </div>

            {/* 中间对战信息 */}
            <div className="flex flex-col items-center gap-4">
              <div className="text-3xl font-bold text-primary-500">
                {tableInfo.stake} STRK
              </div>
              <div className="text-4xl font-bold text-white">VS</div>
              <div className={`badge ${tableInfo.status === 'idle' ? 'badge-success' : 'badge-warning'}`}>
                {tableInfo.status === 'idle' ? '空闲' : '对战中'}
              </div>
            </div>

            {/* 玩家B信息 */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm opacity-80">
                {tableInfo.player_b_address ? 
                  `${tableInfo.player_b_address.slice(0, 6)}...${tableInfo.player_b_address.slice(-4)}` : 
                  '等待加入'
                }
              </span>
              {tableInfo.player_b_address ? (
                <Image
                  src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${tableInfo.player_b_address}`}
                  alt="玩家B头像"
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-base-300"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-base-300 flex items-center justify-center">
                  <span className="text-2xl opacity-30">?</span>
                </div>
              )}
            </div>
          </div>

          {/* 中间横向分隔线 */}
          <div className="border-t-2 border-white/20 my-8"></div>

          {/* 下半部分：出牌区域 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">出牌区域</h2>
          </div>

          <div className="flex justify-between gap-8 mb-8">
            {/* 对手出牌区 */}
            <div className="flex-1 flex flex-col items-center">
              <div className="w-48 h-64 border-[3px] border-red-500/70 rounded-lg flex items-center justify-center mb-4">
                {gameStatus === "revealed" ? (
                  <span className="text-6xl transform hover:scale-110 transition-transform">🎴</span>
                ) : (
                  <span className="text-gray-300 text-lg">
                    {opponentSelected ? "已出牌" : "等待出牌"}
                  </span>
                )}
              </div>
            </div>

            {/* 中间竖向分隔线 */}
            <div className="border-r-2 border-white/20 h-64"></div>

            {/* 我的出牌区 */}
            <div className="flex-1 flex flex-col items-center">
              <button 
                onClick={() => gameStatus === "selecting" && setIsSelectingCard(true)}
                className="w-48 h-64 border-[3px] border-red-500/70 rounded-lg flex items-center justify-center mb-4 hover:bg-base-200/30 transition-all"
                disabled={gameStatus !== "selecting"}
              >
                {selectedCard ? (
                  isCardFaceUp ? (
                    <span className="text-7xl transform hover:scale-110 transition-transform">
                      {cards.find(c => c.type === selectedCard)?.emoji}
                    </span>
                  ) : (
                    <div className="w-full h-full rounded-lg overflow-hidden relative">
                      {/* 斜条纹背景 */}
                      <div 
                        className="absolute inset-0" 
                        style={{
                          background: `repeating-linear-gradient(
                            45deg,
                            #2C3E50,
                            #2C3E50 10px,
                            #34495E 10px,
                            #34495E 20px
                          )`
                        }}
                      />
                      {/* 卡牌中心图案 */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
    
                          <span className="text-8xl">
                            🃏
                          </span>
                    
                      </div>
                    </div>
                  )
                ) : (
                  <span className="text-gray-300 text-lg">
                    点击选择卡牌
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-8">
            <button 
              className="btn btn-primary min-w-[120px] bg-red-500 hover:bg-red-600 border-none"
              disabled={gameStatus !== "selecting" || !selectedCard}
              onClick={handlePlay}
            >
              出牌
            </button>
            <button 
              className="btn btn-secondary min-w-[120px] bg-blue-500 hover:bg-blue-600 border-none"
              disabled={gameStatus !== "selected" || !opponentSelected}
              onClick={handleReveal}
            >
              开牌
            </button>
          </div>
        </div>
      </div>

      {/* 返回按钮 */}
      <div className="mt-8">
        <Link href="/" className="btn btn-outline">
          返回大厅
        </Link>
      </div>

      {/* 选择卡牌弹窗 */}
      {isSelectingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-6 text-center">选择你要出的牌</h3>
            <div className="grid grid-cols-3 gap-4">
              {cards.map((card) => (
                <button
                  key={card.type}
                  onClick={() => handleSelectCard(card.type)}
                  className="flex flex-col items-center gap-3 p-6 rounded-lg hover:bg-base-200 transition-all hover:scale-105"
                >
                  <span className="text-6xl">{card.emoji}</span>
                  <span className="text-sm">{card.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <button 
                className="btn btn-outline"
                onClick={() => setIsSelectingCard(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePage; 