import { useState } from "react";
import { useAccount } from "@starknet-react/core";
import { notification } from "../../utils/notification";

interface TableActionsProps {
  tableId: number;
  playerAAddress: string | null;
  playerBAddress: string | null;
  status: string;
  stake: number;
  onJoinSuccess?: () => void;
}

const TableActions = ({ tableId, playerAAddress, playerBAddress, status, stake, onJoinSuccess }: TableActionsProps) => {
  const { address } = useAccount();
  const [isJoining, setIsJoining] = useState(false);

  // 检查玩家是否已在桌子中
  const isPlayerInTable = address && (address === playerAAddress || address === playerBAddress);
  // 检查桌子是否已满
  const isTableFull = playerAAddress && playerBAddress;
  // 检查是否可以加入
  const canJoin = !isPlayerInTable && !isTableFull && status === "idle";

  const handleJoinTable = async () => {
    if (!address) {
      notification.warning("请先连接钱包");
      return;
    }

    if (isTableFull) {
      notification.warning("该桌子已满");
      return;
    }

    if (status !== "idle") {
      notification.warning("游戏已经开始");
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch("/api/tables/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          playerAddress: address,
          playerAvatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${address}`
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      notification.success("成功加入桌子");
      onJoinSuccess?.();
    } catch (error) {
      console.error("加入桌子失败:", error);
      notification.error(error instanceof Error ? error.message : "加入失败");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveTable = async () => {
    if (!address) {
      notification.warning("请先连接钱包");
      return;
    }

    setIsJoining(true);
    try {
      const response = await fetch("/api/tables/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          playerAddress: address
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      notification.success("成功退出桌子");
      onJoinSuccess?.();
    } catch (error) {
      console.error("退出桌子失败:", error);
      notification.error(error instanceof Error ? error.message : "退出失败");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex gap-4">
      {canJoin && (
        <button
          onClick={handleJoinTable}
          disabled={isJoining}
          className="btn btn-primary min-w-[120px]"
        >
          {isJoining ? "处理中..." : `加入桌子 (${stake} STRK)`}
        </button>
      )}
      {isPlayerInTable && (
        <button
          onClick={handleLeaveTable}
          disabled={isJoining}
          className="btn btn-outline min-w-[120px]"
        >
          {isJoining ? "处理中..." : "退出桌子"}
        </button>
      )}
    </div>
  );
};

export default TableActions; 