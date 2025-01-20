'use client'
import { useExplorer, useNetwork,useAccount ,useDisconnect, useBalance } from "@starknet-react/core"
// import { useContractRead } from "@starknet-react/core"
import { Button } from "@radix-ui/themes";

export default function Explorer() {
    const explorer = useExplorer();
    const { chain } = useNetwork();
    const { account,address,status,connector } =useAccount();

    const { disconnect } = useDisconnect();




    // const {isLoading,isError,error,data} =useBalance({address,watch:true,});
    const {
        data,           // Balance 类型的数据
        error,          // 错误信息
        isLoading,      // 是否加载中
        isError,        // 是否出错
        isSuccess,      // 是否成功
        isFetching,     // 是否获取中
        refetch         // 重新获取数据的函数
    } = useBalance({address, watch: true});
    
        // 使用示例
        if (isLoading) {
            return <div>Loading...</div>;
        }
        
        if (isError) {
            return <div>Error: {error?.message}</div>;
        }
        
        if (data) {
            return <div>
                Balance: {data.formatted} {data.symbol}
                ({data.value.toString()} wei)
            </div>;
        }

    return (
        <div>
            <a href={explorer.transaction('0x64694415eb7406a2db60e7382774a7c528aa23f4a234ca5d0babaf941494be4')}
                target="_blank"
                rel="noreferrer"
            >
                Go to {explorer.name}
            </a>
            <div>id: {chain?.id}</div>
            <div>name: {chain?.name}</div>

            <div> Account:{address}  connect from {connector?.name}</div>

            <Button onClick={() => disconnect()}> asdf</Button>

        </div>
    );
}