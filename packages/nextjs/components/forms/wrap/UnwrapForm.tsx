import React, {useState, useEffect} from 'react'
import Router from 'next/router'
import { useSwitchNetwork, useChainId, useAccount, useSigner, erc20ABI } from 'wagmi'
import Button from '../../Button'
import { NumberInput, Input, Select } from '@chakra-ui/react'
import { notification } from '~~/utils/scaffold-eth'
import { ethers } from 'ethers'
import supportNetworks from "~~/resources/wrap/supportedNetworks.json"
import erc20TokenCloneABI from "~~/resources/abi/erc20TokenCloneABI.json"
import nativeTokenCloneABI from "~~/resources/abi/nativeTokenCloneABI.json"

type Props = {}
function UnwrapForm({}: Props) {
    const chainId = useChainId()
    const {switchNetwork} = useSwitchNetwork({
        onMutate: () => {
            notification.info(`Switching to ${network.name}`)
        },
        onSuccess: () => {
            notification.success("Network switched")
            Router.reload()
        },
        onError: (error) => {
            notification.error("Failed to switch network")
            notification.error(JSON.stringify(error))
        }
    })
    const {data: signer, isLoading: isLoadingSigner} = useSigner()
    const {address: account, isConnected} = useAccount()

    const [network, setNetwork] = useState(supportNetworks[0])
    const [networkTokenClones, setNetworkTokenClones] = useState(supportNetworks[0].tokens)
    const [token, setToken] = useState(supportNetworks[0].tokens[0])
    const [isUnwrapping, setIsUnwrapping] = useState(false)
    const [balance, setBalance] = useState("")
    const [isLoadingBalanceSuccessful, setIsLoadingBalanceSuccessful] = useState(false)

    const isNetworkSwitched = () => {
        return chainId !== network.chainId
    }

    const handleNetworkChange = (chainId: number) => {
        const network = supportNetworks.find(network => network.chainId === chainId)
        if(network) {
            setNetwork(network)
        }
    }

    const handleTokenChange = (e: any) => {
        const clone = e.target.value
        const selectedNetwork = supportNetworks.find(_network => _network.chainId === network.chainId)
        const token = selectedNetwork?.tokens.find(token => token.clone === clone)
        if(token) {
            setToken(_token => ({...token, amount: _token.amount}))
        }
    }

    const handleNetworkSwitch = () => {
        if(isConnected) {
            switchNetwork?.(network.chainId)
        } else {
            notification.info("Connect Wallet!")
        }
    }

    const unwrap = async () => {
        if(isUnwrapping) return
        if(!isConnected) {
            notification.info("Connect Wallet")
            return
        }
        if(isLoadingSigner) {
            notification.info("Loading signer...")
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
        try {
            if(token.isNative) {
                contract = new ethers.Contract(token.clone, nativeTokenCloneABI, signer)

            } else {
                contract = new ethers.Contract(token.clone, erc20TokenCloneABI, signer)
            }
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
        setToken(network.tokenClones[0])
        if(!isNetworkSwitched()) {
            setNetworkTokenClones(network.tokenClones)
        }
    }, [network])

    useEffect(() => {
        if(chainId !== network.chainId) {
            handleNetworkChange(chainId)
        }
    }, [chainId])

    const readBalance = async () => {
        if(isLoadingSigner || !isConnected || isNetworkSwitched()) return
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

                <Select onChange={e => handleNetworkChange(Number(e.target.value))} value={network.chainId}>
                    {supportNetworks.map(network =>  <option key={network.chainId} value={network.chainId}>{network.name}</option>)}
                </Select>
            </div>
            {isNetworkSwitched() && <Button outline label="Switch Network" className="w-full" onClick={handleNetworkSwitch} />}

            <NumberInput className='flex mt-7'>
                <Input type='number' placeholder='Amount' value={token.amount || ""} onChange={e => setToken(token => ({...token, amount: Number(e.target.value)}))} />
                <select defaultValue={networkTokenClones?.[0].name} className='min-w-[120px] border border-[#CBD5E0] rounded-md px-2 bg-white' onChange={handleTokenChange}>
                    {networkTokenClones?.map(token =>  <option key={token.clone} value={token.clone}>{token.name}</option>)}
                </select>
            </NumberInput>
            <div className='flex items-center justify-between'>
                <p className={`text-sm text-[#624DE3] cursor-pointer hover:font-bold ${!isConnected || !isLoadingBalanceSuccessful? 'invisible': ''}`} onClick={() => {
                    if(!isConnected || !isLoadingBalanceSuccessful) return
                    setToken(token => ({...token, amount: Number(balance)}))
                }}>MAX</p>
                <p className={`text-sm text-gray-700 ${!isConnected || !isLoadingBalanceSuccessful? 'invisible': ''}`}>Balance: {Number(balance).toFixed(4)}</p>
            </div>

            <Button label="Unwrap" className='w-full' onClick={unwrap} isLoading={isUnwrapping} />
        </>
    )
}

export default UnwrapForm