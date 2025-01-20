"use client";

import { useState } from "react";
import { useAccount ,useContract} from "@starknet-react/core";
import { Contract, CallData } from "starknet";

// MyContract ABI
const MY_CONTRACT_ADDRESS = "0x50fc3d735c6ac0abaab1960500c0869a0865fa7445fae87b2e25f01c3e4780d";

// 定义合约 ABI
const CONTRACT_ABI = [
  {
    type: "function",
    name: "boundary",
    inputs: [],
    outputs: [{ type: "u64" }],
  },
  {
    type: "function",
    name: "area",
    inputs: [
      { 
        name: "rect",
        type: "struct Rectangle",
        components: [
          { name: "h", type: "u64" },
          { name: "w", type: "u64" }
        ]
      }
    ],
    outputs: [{ type: "u64" }],
  },
  {
    type: "function",
    name: "change",
    inputs: [
      { 
        name: "rect",
        type: "struct Rectangle",
        components: [
          { name: "h", type: "u64" },
          { name: "w", type: "u64" }
        ]
      },
      { name: "h", type: "u64" },
      { name: "w", type: "u64" }
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "get_rect",
    inputs: [],
    outputs: [
      { 
        name: "rect",
        type: "struct Rectangle",
        components: [
          { name: "h", type: "u64" },
          { name: "w", type: "u64" }
        ]
      }
    ],
  }
];

const Test2Page = () => {
  const { address, account } = useAccount();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 测试 boundary 方法
  const testBoundary = async () => {
    if (!account) {
      setResult({ error: "请先连接钱包" });
      return;
    }
    setLoading(true);
    try {
      const contract = new Contract(CONTRACT_ABI, MY_CONTRACT_ADDRESS, account);
      
      // 使用 myCall 来调用 view 方法
      const response = await contract.boundary.call();
      
      // 添加调试日志
      console.log("Raw response:", response);

      // Starknet.js 返回的是一个数组，第一个元素是结果
      const boundaryValue = Array.isArray(response) ? response[0] : response;

      setResult({
        method: "boundary",
        output: {
          value: boundaryValue.toString(),
          raw: JSON.stringify(response),
          type: typeof boundaryValue
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

  // 测试 area 方法
  const testArea = async () => {
    if (!account) {
      setResult({ error: "请先连接钱包" });
      return;
    }
    setLoading(true);
    try {
      const contract = new Contract(CONTRACT_ABI, MY_CONTRACT_ADDRESS, account);
      
      const calldata = CallData.compile({
        rect: { h: 10, w: 20 }
      });

      const response = await contract.area.call(calldata);

      setResult({
        method: "area",
        input: { h: 10, w: 20 },
        output: response.toString()
      });
    } catch (error) {
      console.error("调用 area 失败:", error);
      setResult({
        method: "area",
        error: error instanceof Error ? error.message : "未知错误"
      });
    } finally {
      setLoading(false);
    }
  };

  // 测试 change 方法
  const testChange = async () => {
    if (!account) {
      setResult({ error: "请先连接钱包" });
      return;
    }
    setLoading(true);
    try {
      const contract = new Contract(CONTRACT_ABI, MY_CONTRACT_ADDRESS, account);
      
      const calldata = CallData.compile({
        rect: { h: 10, w: 20 },
        h: 30,
        w: 40
      });

      const response = await contract.change(calldata);

      setResult({
        method: "change",
        input: { rect: { h: 10, w: 20 }, new_h: 30, new_w: 40 },
        tx_hash: response.transaction_hash
      });
    } catch (error) {
      console.error("调用 change 失败:", error);
      setResult({
        method: "change",
        error: error instanceof Error ? error.message : "未知错误"
      });
    } finally {
      setLoading(false);
    }
  };

  // 添加获取 Rectangle 的方法
  const getRectangle = async () => {
    if (!account) {
      setResult({ error: "请先连接钱包" });
      return;
    }
    setLoading(true);
    try {
      const contract = new Contract(CONTRACT_ABI, MY_CONTRACT_ADDRESS, account);
      
      const response = await contract.get_rect.call();
      console.log("Get rect response:", response);

      // 处理返回的 Rectangle 结构
      const rect = Array.isArray(response) ? response[0] : response;
      
      setResult({
        method: "get_rect",
        output: {
          h: rect.h.toString(),
          w: rect.w.toString(),
          raw: JSON.stringify(response)
        }
      });
    } catch (error) {
      console.error("获取 Rectangle 失败:", error);
      setResult({
        method: "get_rect",
        error: error instanceof Error ? error.message : "未知错误"
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
            合约地址: {MY_CONTRACT_ADDRESS}
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

        {/* 测试按钮区域 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testBoundary}
            disabled={loading || !address}
            className="btn btn-primary"
          >
            测试 Boundary
          </button>
          <button
            onClick={testArea}
            disabled={loading || !address}
            className="btn btn-primary"
          >
            测试 Area
          </button>
          <button
            onClick={testChange}
            disabled={loading || !address}
            className="btn btn-primary"
          >
            测试 Change
          </button>
          <button
            onClick={getRectangle}
            disabled={loading || !address}
            className="btn btn-primary"
          >
            获取当前 Rectangle
          </button>
        </div>

        {/* 结果显示区域 */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">测试结果:</h2>
          {loading ? (
            <div className="animate-pulse bg-base-200 p-4 rounded-lg">
              Loading...
            </div>
          ) : (
            <pre className="bg-base-200 p-4 rounded-lg overflow-auto max-h-96">
              {result ? JSON.stringify(result, null, 2) : '尚未执行测试'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default Test2Page; 