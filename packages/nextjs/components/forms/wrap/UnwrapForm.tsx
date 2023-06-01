import React, {useState, useEffect} from 'react'
import Router from 'next/router'
import { useSwitchNetwork, useChainId, useAccount, useSigner, erc20ABI } from 'wagmi'
import Button from '../../Button'
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth'
import { NumberInput, NumberInputField, Select } from '@chakra-ui/react'
import { notification } from '~~/utils/scaffold-eth'
import { ethers } from 'ethers'
import supportNetworks from "~~/resources/wrap/supportedNetworks.json"

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

const TOKENS = [
    {
        name: "ETHc",
        isNative: true,
        "address": "",
        clone: "0xaFe79D30940218584ec95dFF49cCBB03aa8B3682",
        amount: 0
    },
    {
        name: "cMATICc",
        isNative: false,
        address: "0x10b9980C12DDC8B6b1d06C1d50B64f7d400CA0FD",
        clone: "0xAb47256134F7653a3E7E5a5533732bD3B1AD6668",
        amount: 0
    }
]

type Props = {}
function UnwrapForm({}: Props) {
    const chainId = useChainId()
    const {switchNetwork} = useSwitchNetwork({
        onSuccess: () => {
            Router.reload()
        }
    })
    const {data: signer, isLoading: isLoadingSigner} = useSigner()
    const {address: account, isConnected} = useAccount()

    const [network, setNetwork] = useState(supportNetworks[0])
    const [token, setToken] = useState(supportNetworks[0].tokens[0])
    const [isUnwrapping, setIsUnwrapping] = useState(false)
    const [balance, setBalance] = useState("")
    const [isLoadingBalanceSuccessful, setIsLoadingBalanceSuccessful] = useState(false)

    const {data: ethClone, isLoading: isLoadingETHClone} = useDeployedContractInfo("ETHClone")
    const {data: erc20TokenClone, isLoading: isLoadingERC20TokenClone} = useDeployedContractInfo("ERC20TokenClone")

    const handleNetworkChange = (e: any) => {
        const chainId = Number(e.target.value)
        const network = supportNetworks.find(network => network.chainId === chainId)
        setNetwork(network!)
    }

    const handleTokenChange = (e: any) => {
        const clone = e.target.value
        const selectedNetwork = supportNetworks.find(_network => _network.chainId === network.chainId)
        const token = selectedNetwork?.tokens.find(token => token.clone === clone)
        setToken(_token => ({...token!, amount: _token.amount}))
    }

    const unwrap = async () => {
        if(isUnwrapping) return
        if(!isConnected) {
            notification.info("Connect Wallet")
            return
        }
        if(isLoadingSigner || isLoadingETHClone || isLoadingERC20TokenClone) {
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

        setIsUnwrapping(true)
        let notificationId
        const amount = ethers.utils.parseEther(token.amount.toString())
        let contract
        if(token.isNative) {
            contract = new ethers.Contract(token.clone, ethClone?.abi, signer)

        } else {
            contract = new ethers.Contract(token.clone, erc20TokenClone?.abi, signer)
        }
        try {
            notificationId = notification.loading(`Unwrapping ${token.amount} ${token.name}`)

            const withdrawTx = await contract.withdraw(amount)
            await withdrawTx.wait(1)
            
            notification.success("Unwrapped!")
        } catch(error) {
            notification.error(JSON.stringify(error))
        } finally {
            notification.remove(notificationId)
            setIsUnwrapping(false)
        }
    }

    useEffect(() => {
        setToken(network.tokens[0])
    }, [network])

    const readBalance = async () => {
        if(isLoadingSigner || !isConnected) return
        try {
            setIsLoadingBalanceSuccessful(false)
            const _token = new ethers.Contract(token.clone, erc20ABI, signer)
            const balance = await _token.balanceOf(account)
            setBalance(ethers.utils.formatEther(balance))
            setIsLoadingBalanceSuccessful(true)
        } catch(error) {
            console.log(`Error reading balance of ${token.name}`)
            console.error(error)
        }
    }

    useEffect(() => {
        readBalance()
    }, [token.name, account, isUnwrapping, isLoadingSigner])
    return (
        <>
            <div className='flex flex-col items-center space-y-10 w-60 mx-auto' aria-label='network'>
                <div className='flex justify-center item-center shadow-[0_0_5px_3px_#624DE3] p-2 rounded-3xl'>
                <img src={network.img.url} alt={network.img.alt} className='w-16 h-16' />
                </div>

                <Select onChange={handleNetworkChange}>
                    {supportNetworks.map(network =>  <option key={network.chainId} value={network.chainId}>{network.name}</option>)}
                </Select>
            </div>
            {chainId !== network.chainId && <Button outline label="Switch Network" className="w-full" onClick={() => switchNetwork?.(network.chainId)} />}

            <NumberInput className='flex mt-7'>
            <NumberInputField className='w-full border border-gray-300 pl-2' placeholder='Amount' value={token.amount || ""} onChange={e => setToken(token => ({...token, amount: Number(e.target.value)}))} />
            <div className='w-[180px]'>
                <Select defaultValue={network.tokens?.[0].name} className='w-[50px]' onChange={handleTokenChange}>
                    {network.tokens?.map(token =>  <option key={token.clone} value={token.clone}>{token.name}</option>)}
                </Select>
            </div>
            </NumberInput>
            <p className={`text-right text-sm text-gray-700 ${!isConnected || !isLoadingBalanceSuccessful? 'invisible': ''}`}>Balance: {Number(balance).toFixed(4)}</p>

            <Button label="Unwrap" className='w-full' onClick={unwrap} isLoading={isUnwrapping} />
        </>
    )
}

export default UnwrapForm