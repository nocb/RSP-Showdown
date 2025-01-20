"use client"
import { useContract, useReadContract, useAccount } from "@starknet-react/core"
import { universalStrkAddress } from "~~/utils/Constants";
import Explorer from "~~/components/table/Explorer";
import deployedContracts from "~~/contracts/deployedContracts";


const contractAddress = universalStrkAddress; 
const abi = deployedContracts.sepolia.MyContract.abi;

export default function StarkContract() {
    const { address } = useAccount();
    const { contract } = useContract({ abi, address: contractAddress });

    const { data, isError, isLoading, error } = useReadContract({
        functionName: "balanceOf",
        args: [address],
        abi,
        address: contractAddress,
    });

    // const { data, isError, isLoading, error } = useReadContract({
    //     functionName: "balanceOf",
    //     args: [address],
    //     abi,
    //     address: contractAddress,
    // });
 

    const balanceInEther = data ? (Number(data) / 10 ** 18) : 0 ;
    const balance = balanceInEther.toFixed(4);  // 保留 4 位小数

    return (
        <div>
            {contract?.address}
            <br />
            <Explorer />

            <div>
                balance: {balance}
            </div>
        </div>
    );
}

