"use client";

import { blo } from "blo";

interface BlockieAvatarProps {
  address: string;
  ensImage?: string | null;
  size: number;
}

// 生成玩家头像的函数
const generateAvatarUrl = (address: string) => {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${address}`;   //  lorelei
  //https://api.dicebear.com/9.x/adventurer/svg
  //https://api.dicebear.com/9.x/dylan/svg?seed=${address}
};

// Custom Avatar for RainbowKit
export const BlockieAvatar = ({
  address,
  ensImage,
  size,
}: BlockieAvatarProps) => (
  // Don't want to use nextJS Image here (and adding remote patterns for the URL)
  // eslint-disable-next-line @next/next/no-img-element
  <img
    className="rounded-full"
    src={ensImage || generateAvatarUrl(address as `0x${string}`)} 
    width={size}
    height={size}
    alt={`${address} avatar`}
  />
);
