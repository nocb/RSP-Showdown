"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAccount } from "@starknet-react/core";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { logWithTime } from "~~/utils/logger";
import type { TableInfo } from "~~/utils/db";

const generateAvatarUrl = (address: string) => {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${address}`;   //  lorelei
};
// 渲染玩家头像的组件
const PlayerAvatar = ({ avatar, address }: { avatar: string | null; address: string | null }) => {
  if (!avatar || !address) {
    return (
      <div className="w-[50px] h-[50px] rounded-full bg-base-300 flex items-center justify-center">
        <span className="text-2xl opacity-30">?</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <Image
        src={avatar}
        alt="player"
        width={70}
        height={70}
        // className="rounded-full"
        className="rounded-full border-2 border-base-300"
      />
      {/* 悬停显示地址 */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {address.slice(0, 6)}...{address.slice(-4)}
      </div>
    </div>
  );
};

const Home = () => {
  const router = useRouter();
  const { status: walletStatus, address: walletAddress } = useAccount();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // 处理桌子点击
  const handleTableClick = async (table: TableInfo) => {
    // 1. 检查钱包连接状态
    if (walletStatus !== "connected" || !walletAddress) {
      toast.error("请先连接钱包", {
        duration: 3000,
        position: 'top-center',
        icon: '🔗',
      });
      
      // 自动触发钱包连接
      const connectButton = document.querySelector('[data-id="connect-button"]');
      if (connectButton instanceof HTMLElement) {
        connectButton.click();
      }
      return;
    }

    try {
      // 2. 获取桌子的最新状态
      const response = await fetch(`/api/table/${table.table_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch table info');
      }
      const latestTable = await response.json();

      // 3. 检查桌子状态是否改变
      if (latestTable.status === 'in_use') {
        toast.error("该桌子已被其他玩家加入，请选择其他桌子", {
          duration: 3000,
          position: 'top-center',
          icon: '⚔️',
        });
        return;
      }

      // 4. 如果桌子状态正常，跳转到桌子页面
      router.push(`/table/${table.table_id}`);
    } catch (error) {
      toast.error("获取桌子信息失败", {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  // 获取桌子数据
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch('/api/tables');
        if (!response.ok) {
          throw new Error('Failed to fetch tables');
        }
        const data = await response.json();
        setTables(data);
      } catch (error) {
        toast.error("获取桌子信息失败", {
          duration: 3000,
          position: 'top-center',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          <span className="block text-4xl font-bold">Rock Scissors Paper Showdown</span>
        </h1>
        <p className="text-center text-lg">
          Have a fair showdown on the blockchain with your friends.
        </p>
      </div>

      <div className="bg-container flex-grow w-full mt-16 px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tables.map((table) => (
            <button  // 改用 button 而不是 Link
              key={table.table_id}
              onClick={() => handleTableClick(table)}
              className="flex flex-col bg-base-100 relative text-center items-center rounded-3xl border border-gradient p-6 hover:bg-base-200 transition-colors cursor-pointer"
            >
              <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  #{table.table_id}
                </span>
              </div>

              {/* 状态标签 */}
              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium
                ${table.status === 'idle' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                {table.status === 'idle' ? '空闲' : '对战中'}
              </div>

              <div className="flex items-center justify-center gap-8 w-full">
                <PlayerAvatar 
                  avatar={table.player_a_address? generateAvatarUrl(table.player_a_address) : null} 
                  address={table.player_a_address}
                />

                <div className="relative">
                  <div className="w-28 h-28 bg-teal-400 rounded-2xl flex items-center justify-center shadow-xl">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-bold text-white drop-shadow-md">
                        {table.stake.toFixed(0)}
                      </span>
                      <span className="text-sm text-white/90">
                        STRK
                      </span>
                    </div>
                  </div>
                  <div className="w-28 h-4 bg-teal-600 absolute -bottom-1 left-0 rounded-b-lg"></div>
                </div>

                <PlayerAvatar 
                  avatar={table.player_b_address? generateAvatarUrl(table.player_b_address) : null} 
                  address={table.player_b_address}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
