import Link from "next/link";
import Image from "next/image";
import { getTables, TableInfo } from "~~/utils/db";

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
        width={50}
        height={50}
        className="rounded-full"
      />
      {/* 悬停显示地址 */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
        {address.slice(0, 6)}...{address.slice(-4)}
      </div>
    </div>
  );
};

const Home = async () => {
  console.log('Home page rendering...');
  
  try {
    // 获取桌子数据
    const tables = await getTables();
    console.log('Tables data in Home:', tables);

    if (!tables || tables.length === 0) {
      console.log('No tables found');
    }

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
              <Link
                href={`/table/${table.table_id}`}
                key={table.table_id}
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
                    avatar={table.player_a_avatar} 
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
                    avatar={table.player_b_avatar} 
                    address={table.player_b_address}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in Home page:', error);
    // 可以添加一个错误状态的显示
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error loading tables</h1>
          <p className="text-gray-500">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
};

export default Home;
