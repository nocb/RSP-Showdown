use openzeppelin_token::erc20::interface::{IERC20CamelDispatcher, IERC20CamelDispatcherTrait};
use starknet::ContractAddress;

#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct Rectangle {   
    h: u64,
    w: u64,
}

#[starknet::interface]
trait MyContractTrait<TContractState> {
    fn boundary(self: @TContractState, rect: Rectangle) -> u64;
    fn area(self: @TContractState, rect: Rectangle) -> u64;
    fn change(ref self: TContractState, rect: Rectangle, h: u64, w: u64);
}

#[starknet::contract]
mod MyContract {
    use super::{IERC20CamelDispatcher, Rectangle};

    #[storage]
    struct Storage {
        eth_token: IERC20CamelDispatcher,
        prize: u256,
        rect: Rectangle,
    }

    #[abi(embed_v0)]
    impl MyContractImpl of super::MyContractTrait<ContractState> {
        fn boundary(self: @ContractState, rect: Rectangle) -> u64 {
            let zc: u64 = 2 * rect.h + 2 * rect.w;
            return zc;
        }

        fn area(self: @ContractState, rect: Rectangle) -> u64 {
            rect.h * rect.w
        }

        fn change(ref self: ContractState, rect: Rectangle, h: u64, w: u64) {
            let mut new_rect = rect;
            new_rect.h = h;
            new_rect.w = w;
        }
    }
}




