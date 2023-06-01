import React, {useEffect, useState} from 'react'
import Router from 'next/router'
import { useSwitchNetwork, useChainId, useAccount, useProvider, useSigner, erc20ABI } from 'wagmi'
import Button from '../../Button'
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth'
import { NumberInput, NumberInputField, Select } from '@chakra-ui/react'
import { notification } from '~~/utils/scaffold-eth'
import { ethers } from 'ethers'

const NETWORKS = [
    {
        name: "Sepolia",
        chainId: 11155111, 
        img: {url: '/images/eth-icon.png', alt: 'ethereum'}},
    {
        name: "Mumbai",
        chainId: 80001,
        img: {url: '/images/polygon-icon.png', alt: 'polygon'}
    }
]

interface Token {
    name: string;
    isNative: boolean;
    address: string;
    cloneContract: string;
    amount: number;
}

const TOKENS: Token[] = [
    {
        name: "ETH",
        isNative: true,
        address: "",
        cloneContract: "0xaFe79D30940218584ec95dFF49cCBB03aa8B3682",
        amount: 0
    },
    {
        name: "MATICc",
        isNative: false,
        address: "0x10b9980C12DDC8B6b1d06C1d50B64f7d400CA0FD",
        cloneContract: "0xAb47256134F7653a3E7E5a5533732bD3B1AD6668",
        amount: 0
    }
]

type Props = {}
function WrapForm({}: Props) {
    const chainId = useChainId()
    const {switchNetwork} = useSwitchNetwork({
        onSuccess: () => {
            Router.reload()
        }
    })
    const provider = useProvider()
    const {data: signer, isLoading: isLoadingSigner} = useSigner()
    const {address: account, isConnected} = useAccount()

    const [network, setNetwork] = useState(NETWORKS[0])
    const [token, setToken] = useState(TOKENS[0])
    const [isWrapping, setIsWrapping] = useState(false)
    const [balance, setBalance] = useState("")
    const [isLoadingBalanceSuccessful, setIsLoadingBalanceSuccessful] = useState(false)
    const [wrappedToken, setWrappedToken] = useState<any>()

    const {data: erc20TokenClone, isLoading: isLoadingERC20TokenClone} = useDeployedContractInfo("ERC20TokenClone")

    const handleNetworkChange = (e: any) => {
        const chainId = Number(e.target.value)
        const network = NETWORKS.find(network => network.chainId === chainId)
        setNetwork(network!)
    }

    const handleTokenChange = (e: any) => {
        const cloneContract = e.target.value
        const token = TOKENS.find(network => network.cloneContract === cloneContract)
        setToken(_token => ({...token!, amount: _token.amount}))
    }

    const wrap = async () => {
        if(isWrapping) return
        if(!isConnected) {
            notification.info("Connect Wallet")
            return
        }
        if(isLoadingSigner || isLoadingERC20TokenClone) {
            notification.info("Loading resources...")
            return
        }
        if(token.amount <= 0) {
            notification.warning("Invalid amount!")
            return
        }
        if(isLoadingBalanceSuccessful && token.amount > Number(balance)) {
            notification.error("Amount exceeds balance")
            return
        }

        setIsWrapping(true)
        let notificationId
        const amount = ethers.utils.parseEther(token.amount.toString())
        if(token.isNative) {
            notificationId = notification.loading(`Wrapping ${token.amount} ${token.name}`)
            try {
                const tx = await signer?.sendTransaction({
                    to: token.cloneContract,
                    value: amount
                })
                await tx?.wait(1)
                
                notification.success("That's a wrap!")

                const contract = new ethers.Contract(token.cloneContract, erc20ABI, provider)
                const [symbol, decimals] = await Promise.all([
                    contract.symbol(),
                    contract.decimals()
                ])    
                setWrappedToken({contract: token.cloneContract, symbol, decimals})
            } catch(error) {
                notification.error(JSON.stringify(error))
            }
        } else {
            try {
                const _token = new ethers.Contract(token.address, erc20ABI, signer)

                notificationId = notification.loading(`Approving ${token.amount} ${token.name}`)
                const approveTx = await _token.approve(token.cloneContract, amount)
                await approveTx.wait(1)
                notification.remove(notificationId)
                notification.success("Approved!")
    
                notificationId = notification.loading(`Wrapping ${token.amount} ${token.name}`)
                const tokenCloneContract = new ethers.Contract(token.cloneContract, erc20TokenClone?.abi, signer)
                const depositTx = await tokenCloneContract.deposit(amount)
                await depositTx.wait(1)
                
                notification.success("That's a wrap!")
                const [symbol, decimals] = await Promise.all([
                    tokenCloneContract.symbol(),
                    tokenCloneContract.decimals()
                ])    
                setWrappedToken({contract: token.cloneContract, symbol, decimals})
            } catch(error) {
                notification.error(JSON.stringify(error))
            }
        }
        notification.remove(notificationId)
        setIsWrapping(false)
    }

    const addTokenToMetamask = async () => {
        if(!window.ethereum || !wrappedToken) return
        try {
            const isAdded = await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: wrappedToken.contract,
                        symbol: wrappedToken.symbol,   
                        decimals: wrappedToken.decimals
                    }
                }
            })

            if(isAdded) {
                notification.success(`${wrappedToken.symbol} added to Metamask`)
                setWrappedToken(null)
            } else {
                notification.error(`Failed to add ${wrappedToken.symbol} to Metamask`)
            }
        } catch(error) {
            notification.error(`Failed to add ${wrappedToken.symbol} to Metamask`)
            console.error(error)
        }
    }

    const readBalance = async () => {
        if(isLoadingSigner || !isConnected) return
        try {
            if(token.isNative) {
                const balance = await provider.getBalance(account!)
                setBalance(ethers.utils.formatEther(balance))
            } else {
                const _token = new ethers.Contract(token.address, erc20ABI, signer)
                const balance = await _token.balanceOf(account)
                setBalance(ethers.utils.formatEther(balance))
            }
            setIsLoadingBalanceSuccessful(true)
        } catch(error) {
            console.log(`Error reading balance of ${token.name}`)
            console.error(error)
            setIsLoadingBalanceSuccessful(false)
            return
        }
    }

    useEffect(() => {
        readBalance()
    }, [token, account, isWrapping, isLoadingSigner])

    return (
        <>
            {/* Select Network */}
            <div className='flex flex-col items-center space-y-10 w-60 mx-auto' aria-label='network'>
                <div className='flex justify-center item-center shadow-[0_0_5px_3px_#624DE3] p-2 rounded-3xl'>
                    <img src={network.img.url} alt={network.img.alt} className='w-16 h-16' />
                </div>

                <Select onChange={handleNetworkChange}>
                    {NETWORKS.map(network =>  <option key={network.chainId} value={network.chainId}>{network.name}</option>)}
                </Select>
            </div>
            {chainId !== network.chainId && <Button outline label="Switch Network" className="w-full" onClick={() => switchNetwork?.(network.chainId)} />}

            <NumberInput className='flex mt-7'>
            <NumberInputField className='w-full border border-gray-300 pl-2' placeholder='Amount' value={token.amount || ""} onChange={e => setToken(token => ({...token, amount: Number(e.target.value)}))} />
            <div className='w-[180px]'>
                <Select defaultValue={TOKENS?.[0].name} className='w-[50px]' onChange={handleTokenChange}>
                    {TOKENS?.map(token =>  <option key={token.cloneContract} value={token.cloneContract}>{token.name}</option>)}
                </Select>
            </div>
            </NumberInput>
            <p className='text-right text-sm text-gray-700'>Balance: {Number(balance).toFixed(4)}</p>
            {wrappedToken? <Button outline label={`Add ${wrappedToken.symbol} to Metamask`} onClick={addTokenToMetamask} /> : null}

            <Button label={token.isNative? "Wrap" : "Approve"} className='w-full' onClick={wrap} isLoading={isWrapping} />
        </>
    )
}

export default WrapForm