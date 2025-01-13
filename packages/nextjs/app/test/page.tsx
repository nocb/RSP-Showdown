"use client";

import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { logWithTime } from "~~/utils/logger";
import type { TableInfo } from "~~/utils/db";

// 添加错误类型检查函数
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'An unknown error occurred';
};

const TestPage = () => {
  const { address: walletAddress } = useAccount();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 测试获取所有桌子
  const testGetTables = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setResult({ endpoint: '/api/tables', data });
    } catch (error: unknown) {
      setResult({ endpoint: '/api/tables', error: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  // 测试获取单个桌子
  const testGetTable = async (tableId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/table/${tableId}`);
      const data = await response.json();
      setResult({ endpoint: `/api/table/${tableId}`, data });
    } catch (error: unknown) {
      setResult({ endpoint: `/api/table/${tableId}`, error: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  // 测试加入桌子
  const testJoinTable = async (tableId: number) => {
    if (!walletAddress) {
      setResult({ endpoint: 'join', error: 'Please connect wallet first' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/table/${tableId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerAddress: walletAddress }),
      });
      const data = await response.json();
      setResult({ endpoint: `join table ${tableId}`, data });
    } catch (error: unknown) {
      setResult({ endpoint: `join table ${tableId}`, error: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  // 测试退出桌子
  const testLeaveTable = async (tableId: number) => {
    if (!walletAddress) {
      setResult({ endpoint: 'leave', error: 'Please connect wallet first' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/table/${tableId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerAddress: walletAddress }),
      });
      const data = await response.json();
      setResult({ endpoint: `leave table ${tableId}`, data });
    } catch (error: unknown) {
      setResult({ endpoint: `leave table ${tableId}`, error: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  // 添加测试获取玩家信息的函数
  const testGetPlayerInfo = async (playerAddress: string) => {
    setLoading(true);
    try {
      // 获取玩家基本信息
      const playerResponse = await fetch(`/api/players/${playerAddress}`);
      const playerData = await playerResponse.json();

      // 获取玩家对局记录
      const gamesResponse = await fetch(`/api/players/${playerAddress}/games`);
      const gamesData = await gamesResponse.json();

      setResult({
        endpoint: `/api/players/${playerAddress}`,
        data: {
          playerInfo: playerData,
          gameRecords: gamesData
        }
      });
    } catch (error: unknown) {
      setResult({
        endpoint: `/api/players/${playerAddress}`,
        error: getErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {/* 测试按钮组 */}
      <div className="space-y-4">
        <div className="space-x-2">
          <button 
            onClick={testGetTables}
            className="btn btn-primary"
            disabled={loading}
          >
            Get All Tables
          </button>

          {[1, 2, 3, 4, 5, 6].map(tableId => (
            <button
              key={tableId}
              onClick={() => testGetTable(tableId)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Get Table {tableId}
            </button>
          ))}
        </div>

        <div className="space-x-2">
          {[1, 2, 3, 4, 5, 6].map(tableId => (
            <button
              key={tableId}
              onClick={() => testJoinTable(tableId)}
              className="btn btn-accent"
              disabled={loading}
            >
              Join Table {tableId}
            </button>
          ))}
        </div>

        <div className="space-x-2">
          {[1, 2, 3, 4, 5, 6].map(tableId => (
            <button
              key={tableId}
              onClick={() => testLeaveTable(tableId)}
              className="btn btn-error"
              disabled={loading}
            >
              Leave Table {tableId}
            </button>
          ))}
        </div>
      </div>

      {/* 添加玩家信息测试区域 */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">Test Player Info</h2>
        
        {/* 如果已连接钱包，显示当前地址的测试按钮 */}
        {walletAddress && (
          <button
            onClick={() => testGetPlayerInfo(walletAddress)}
            className="btn btn-primary"
            disabled={loading}
          >
            Get Current Player Info
          </button>
        )}

        {/* 添加一些测试地址的按钮 */}
        <div className="space-x-2">
          {[
            "0x123...abc", // 替换为实际的测试地址
            "0x456...def",
            "0x789...ghi"
          ].map((address) => (
            <button
              key={address}
              onClick={() => testGetPlayerInfo(address)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Get Player {address.slice(0, 6)}
            </button>
          ))}
        </div>
      </div>

      {/* 显示结果 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Test Result:</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <pre className="bg-base-200 p-4 rounded-lg overflow-auto max-h-96">
            {result ? JSON.stringify(result, null, 2) : 'No result yet'}
          </pre>
        )}
      </div>
    </div>
  );
};

export default TestPage; 