"use client";

import { useState } from "react";
import { useAccount, useContract, useReadContract } from "@starknet-react/core";
import deployedContracts from "~~/contracts/deployedContracts";

// 使用 deployedContracts 中的合约地址和 ABI
const CONTRACT_ADDRESS = deployedContracts.sepolia.MyContract.address;
const CONTRACT_ABI = deployedContracts.sepolia.MyContract.abi;

const Test2Page = () => {
  const { address, account } = useAccount();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 方式1: 使用 useReadContract (自动调用)
  const { data: boundaryData, isError, isLoading, error } = useReadContract({
    functionName: "boundary",
    args: [],
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    enabled: !!account,
  });

  // 方式2: 使用 useContract (手动调用)
  const { contract } = useContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS
  });

  // 手动调用的方法
  const testBoundary = async () => {
    if (!account) {
      setResult({ error: "请先连接钱包" });
      return;
    }
    setLoading(true);
    try {
      const response = await contract.boundary.call();
      
      setResult({
        method: "boundary",
        output: {
          value: response?.toString(),
          raw: response?.toString(),
          type: typeof response,
          // 显示两种方式的结果对比
          autoCallValue: boundaryData?.toString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("调用 boundary 失败:", error);
      setResult({
        method: "boundary",
        error: error instanceof Error ? error.message : "未知错误",
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  // 手动调用 get_rect 方法
  const testGetRect = async () => {
    if (!account) {
      setResult({ error: "请先连接钱包" });
      return;
    }
    setLoading(true);
    try {
      const response = await contract.get_rect.call();
      
      // 添加详细的日志
      console.log("rect raw:", response);
      console.log("rect stringified:", JSON.stringify(response, null, 2));
      console.log("rect properties:", {
        h: response.h.toString(),
        w: response.w.toString()
      });

      setResult({
        method: "get_rect",
        output: {
          // h: response.h.toString(),
          // w: response.w.toString(),
          raw: JSON.stringify(response)
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("获取 Rectangle 失败:", error);
      setResult({
        method: "get_rect",
        error: error instanceof Error ? error.message : "未知错误",
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold mb-4">MyContract 合约测试</h1>
        
        {/* 合约地址显示 */}
        <div className="bg-base-200 p-4 rounded-lg mb-4">
          <p className="text-sm font-mono break-all">
            合约地址: {CONTRACT_ADDRESS}
          </p>
        </div>

        {/* 钱包状态提示 */}
        <div className="mb-4">
          {!address ? (
            <div className="alert alert-warning">请先连接钱包</div>
          ) : (
            <div className="alert alert-success">
              钱包已连接: {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          )}
        </div>

        {/* 显示自动调用的结果 */}
        <div className="mb-4">
          <h3 className="text-lg font-bold">自动调用结果:</h3>
          {isLoading ? (
            <div>Loading...</div>
          ) : isError ? (
            <div>Error: {error?.message}</div>
          ) : (
            <div>Boundary Value: {boundaryData?.toString()}</div>
          )}
        </div>

        {/* 手动调用按钮和结果 */}
        <div className="mb-4">
          <h3 className="text-lg font-bold">手动调用:</h3>
          <div className="flex gap-4">
            <button
              onClick={testBoundary}
              disabled={loading || !address}
              className="btn btn-primary"
            >
              测试 Boundary
            </button>

            <button
              onClick={testGetRect}
              disabled={loading || !address}
              className="btn btn-secondary"
            >
              获取 Rectangle
            </button>
          </div>
          
          {result && (
            <pre className="mt-2 bg-base-200 p-4 rounded-lg overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default Test2Page; 