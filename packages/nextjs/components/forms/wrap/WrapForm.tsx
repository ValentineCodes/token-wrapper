import React, {useEffect, useState} from 'react'
import Router from 'next/router'
import { useSwitchNetwork, useChainId, useAccount, useProvider, useSigner, erc20ABI } from 'wagmi'
import Button from '../../Button'
import { useDeployedContractInfo } from '~~/hooks/scaffold-eth'
import { NumberInput, NumberInputField, Select } from '@chakra-ui/react'
import { notification } from '~~/utils/scaffold-eth'
import { BigNumber, ethers } from 'ethers'
import supportNetworks from "~~/resources/wrap/supportedNetworks.json"

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

    const [network, setNetwork] = useState(supportNetworks[0])
    const [token, setToken] = useState(supportNetworks[0].tokens[0])
    const [isWrapping, setIsWrapping] = useState(false)
    const [balance, setBalance] = useState("")
    const [isLoadingBalanceSuccessful, setIsLoadingBalanceSuccessful] = useState(false)
    const [wrappedToken, setWrappedToken] = useState<any>()

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
                    to: token.clone,
                    value: amount
                })
                await tx?.wait(1)

                // get wrapped token clone params to add to metamask
                try {
                    const contract = new ethers.Contract(token.clone, erc20ABI, provider)
                    const [symbol, decimals] = await Promise.all([
                        contract.symbol(),
                        contract.decimals()
                    ])    
                    setWrappedToken({contract: token.clone, symbol, decimals})
                } catch(error) {
                    console.log("failed to get token clone params")
                    console.error(error)
                } finally {
                    notification.success("That's a wrap!")
                }
            } catch(error) {
                notification.error(JSON.stringify(error))
            }
        } else {
            try {
                const _token = new ethers.Contract(token.address, erc20ABI, signer)

                // check allowance
                const owner = await signer?.getAddress()
                const allowance: BigNumber = await _token.allowance(owner, token.clone)
                if(allowance.lt(amount)) {
                    // approve token clone to spend amount
                    notificationId = notification.loading(`Approving ${token.amount} ${token.name}`)
                    const approveTx = await _token.approve(token.clone, amount)
                    await approveTx.wait(1)
                    notification.remove(notificationId)
                    notification.success("Approved!")
                }
    
                // wrap token
                notificationId = notification.loading(`Wrapping ${token.amount} ${token.name}`)
                const tokenCloneContract = new ethers.Contract(token.clone, erc20TokenClone?.abi, signer)
                const depositTx = await tokenCloneContract.deposit(amount)
                await depositTx.wait(1)
                
                notification.success("That's a wrap!")
                const [symbol, decimals] = await Promise.all([
                    tokenCloneContract.symbol(),
                    tokenCloneContract.decimals()
                ])    
                setWrappedToken({contract: token.clone, symbol, decimals})
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

    useEffect(() => {
        setToken(network.tokens[0])
    }, [network])

    const readBalance = async () => {
        if(isLoadingSigner || !isConnected) return
        try {
            setIsLoadingBalanceSuccessful(false)
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
        }
    }

    useEffect(() => {
        readBalance()
    }, [token.name, account, isWrapping, isLoadingSigner])

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
            {wrappedToken? <Button outline label={`Add ${wrappedToken.symbol} to Metamask`} onClick={addTokenToMetamask} /> : null}

            <Button label="Wrap" className='w-full' onClick={wrap} isLoading={isWrapping} />
        </>
    )
}

export default WrapForm