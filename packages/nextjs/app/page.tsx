import Link from "next/link";
import Image from "next/image";
import { ConnectedAddress } from "~~/components/ConnectedAddress";

const Home = () => {
  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5">
        <h1 className="text-center">
          {/* <span className="block text-2xl mb-2">Welcome to</span> */}
          <span className="block text-4xl font-bold">Rock Scissors Paper Showdown</span>
        </h1>
        {/* <ConnectedAddress /> */}
        <p className="text-center text-lg">
        Have a fair showdown on the blockchain with your friends. 
        </p>
      </div>

      <div className="bg-container flex-grow w-full mt-16 px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((tableNum) => (
            <div key={tableNum} className="flex flex-col bg-base-100 relative text-center items-center rounded-3xl border border-gradient p-6">
              <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  #{tableNum}
                </span>
              </div>

              <div className="flex items-center justify-center gap-8 w-full">
                <Image
                  src="/myhead.jpg"
                  alt="player 1"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                
                <div className="relative">
                  <div className="w-28 h-28 bg-teal-400 rounded-2xl flex items-center justify-center shadow-xl">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-bold text-white drop-shadow-md">
                        0.1
                      </span>
                      <span className="text-sm text-white/90">
                        ETH
                      </span>
                    </div>
                  </div>
                  <div className="w-28 h-4 bg-teal-600 absolute -bottom-1 left-0 rounded-b-lg"></div>
                </div>

                <Image
                  src="/logo_alchemy.png"
                  alt="player 2"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
