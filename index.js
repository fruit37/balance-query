import { Web3 } from 'web3';
import fs from 'fs'

const ABI = JSON.parse(fs.readFileSync('./ABI.json'));
const web3 = new Web3('https://rpc.ankr.com/eth');

const getEthBalance = async (addr) => {
    try {
        const balanceWei = await web3.eth.getBalance(addr);
        return web3.utils.fromWei(balanceWei, 'ether');
    } catch (error) {
        console.error('Error fetching ETH balance:', error);
        throw error;
    }
}

const getErc20Balance = (tokenAddr, decimal, tokenName) => {
    return async (addr) => {
        try {
            const tokenContract = new web3.eth.Contract(ABI, tokenAddr);
            const balance = await tokenContract.methods.balanceOf(addr).call();
            return web3.utils.fromWei(balance, decimal);
        } catch (error) {
            console.error(`Error fetching ${tokenName} balance:`, error);
            throw error;
        }
    }
}

const getUsdtBalance = getErc20Balance('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'mwei', 'USDT')
const getUsdcBalance = getErc20Balance('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 'mwei', 'USDC')

const main = async () => {
    try {
        const ADDR = JSON.parse(fs.readFileSync('./address.json'));
        for(const addr of ADDR) {
            const [ethBalance, usdtBalance, usdcBalance] = await Promise.all([
                getEthBalance(addr),
                getUsdtBalance(addr),
                getUsdcBalance(addr)
            ]);
            console.log(addr, ethBalance, usdtBalance, usdcBalance);
        }
    } catch (error) {
        console.error(error);
    }
}

main()
