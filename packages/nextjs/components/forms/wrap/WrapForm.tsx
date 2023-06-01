import React, {useEffect, useState} from 'react'
import Router from 'next/router'
import { useSwitchNetwork, useChainId, useAccount, useProvider, useSigner, erc20ABI } from 'wagmi'
import Button from '../../Button'
import { NumberInput, NumberInputField, Select } from '@chakra-ui/react'
import { notification } from '~~/utils/scaffold-eth'
import { BigNumber, ethers } from 'ethers'
import supportNetworks from "~~/resources/wrap/supportedNetworks.json"
import erc20TokenCloneABI from "~~/resources/abi/erc20TokenCloneABI.json"
import bgTokenABI from "~~/resources/abi/bgTokenABI.json"

type Props = {}
function WrapForm({}: Props) {
    const chainId = useChainId()
    const provider = useProvider()
    const {data: signer, isLoading: isLoadingSigner} = useSigner()
    const {address: account, isConnected} = useAccount()

    const [network, setNetwork] = useState(supportNetworks[0])
    const [networkTokens, setNetworkTokens] = useState(supportNetworks[0].tokens)
    const [token, setToken] = useState(supportNetworks[0].tokens[0])
    const [isWrapping, setIsWrapping] = useState(false)
    const [balance, setBalance] = useState("")
    const [isLoadingBalanceSuccessful, setIsLoadingBalanceSuccessful] = useState(false)
    const [metamaskToken, setMetamaskToken] = useState<any>()
    const [isMintingBG, setIsMintingBG] = useState(false)
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

    const isNetworkSwitched = () => {
        return chainId !== network.chainId
    }
    const handleNetworkChange = (chainId: number) => {
        const network = supportNetworks.find(network => network.chainId === chainId)
        setNetwork(network!)
    }

    const handleTokenChange = (e: any) => {
        const clone = e.target.value
        const selectedNetwork = supportNetworks.find(_network => _network.chainId === network.chainId)
        const token = selectedNetwork?.tokens.find(token => token.clone === clone)
        setToken(_token => ({...token!, amount: _token.amount}))
    }

    const handleNetworkSwitch = () => {
        if(isConnected) {
            switchNetwork?.(network.chainId)
        } else {
            notification.info("Connect Wallet!")
        }
    }

    const wrap = async () => {
        if(isWrapping) return
        if(!isConnected) {
            notification.info("Connect Wallet")
            return
        }
        if(isLoadingSigner) {
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
                    setMetamaskToken({address: token.clone, symbol, decimals})
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
                const tokenCloneContract = new ethers.Contract(token.clone, erc20TokenCloneABI, signer)
                const depositTx = await tokenCloneContract.deposit(amount)
                await depositTx.wait(1)
                
                // get wrapped token clone params to add to metamask
                try {
                    const contract = new ethers.Contract(token.clone, erc20ABI, provider)
                    const [symbol, decimals] = await Promise.all([
                        contract.symbol(),
                        contract.decimals()
                    ])    
                    setMetamaskToken({address: token.clone, symbol, decimals})
                } catch(error) {
                    console.log("failed to get token clone params")
                    console.error(error)
                } finally {
                    notification.success("That's a wrap!")
                }
            } catch(error) {
                notification.error(JSON.stringify(error))
                console.error(error)
            }
        }
        notification.remove(notificationId)
        setIsWrapping(false)
    }

    const mintBG = async () => {
        if(isMintingBG) return
        if(!isConnected) {
            notification.info("Connect Wallet")
            return
        }
        if(isLoadingSigner) {
            notification.info("Loading signer...")
            return
        }
        let notificationId
        setIsMintingBG(true)
        try {
            notificationId = notification.loading("Minting 100 BG tokens")
            const bgTokenAddress = networkTokens[1].address
            const bg = new ethers.Contract(bgTokenAddress, bgTokenABI, signer )
            const tx = await bg.mint(ethers.utils.parseEther("100"))
            await tx.wait(1)

            // get bg token params to add to metamask
            try {
                const contract = new ethers.Contract(bgTokenAddress, erc20ABI, provider)
                const [symbol, decimals] = await Promise.all([
                    contract.symbol(),
                    contract.decimals()
                ])    
                setMetamaskToken({address: bgTokenAddress, symbol, decimals})
            } catch(error) {
                console.log("failed to get BG token params")
                console.error(error)
            } finally {
                notification.success("Minted 100 BG tokens!")
            }
        } catch(error) {
            notification.error(JSON.stringify(error))
            console.error(error)
        } finally {
            notification.remove(notificationId)
            setIsMintingBG(false)
        }
    }

    const addTokenToMetamask = async () => {
        if(!window.ethereum || !metamaskToken) return
        try {
            const isAdded = await window.ethereum.request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address: metamaskToken.address,
                        symbol: metamaskToken.symbol,   
                        decimals: metamaskToken.decimals
                    }
                }
            })

            if(isAdded) {
                notification.success(`${metamaskToken.symbol} added to Metamask`)
                setMetamaskToken(null)
            } else {
                notification.error(`Failed to add ${metamaskToken.symbol} to Metamask`)
            }
        } catch(error) {
            notification.error(`Failed to add ${metamaskToken.symbol} to Metamask`)
            console.error(error)
        }
    }

    useEffect(() => {
        setToken(network.tokens[0])
        if(!isNetworkSwitched()) {
            setNetworkTokens(network.tokens)
        }
    }, [network])

    useEffect(() => {
        if(isNetworkSwitched()) {
            handleNetworkChange(chainId)
        }
    }, [chainId])

    const readBalance = async () => {
        if(isLoadingSigner || !isConnected || isNetworkSwitched()) return
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

                <Select onChange={e => handleNetworkChange(Number(e.target.value))} value={network.chainId}>
                    {supportNetworks.map(network =>  <option key={network.chainId} value={network.chainId}>{network.name}</option>)}
                </Select>
            </div>
            {isNetworkSwitched() && <Button outline label="Switch Network" className="w-full" onClick={handleNetworkSwitch} />}

            <NumberInput className='flex mt-7'>
                <NumberInputField className='w-full border border-gray-300 pl-2' placeholder='Amount' value={token.amount || ""} onChange={e => setToken(token => ({...token, amount: Number(e.target.value)}))} />
                <select defaultValue={networkTokens?.[0].name} className='min-w-[120px] border border-[#CBD5E0] rounded-md px-2' onChange={handleTokenChange}>
                    {networkTokens?.map(token =>  <option key={token.clone} value={token.clone}>{token.name}</option>)}
                </select>
            </NumberInput>
            <p className={`text-right text-sm text-gray-700 ${!isConnected || !isLoadingBalanceSuccessful? 'invisible': ''}`}>Balance: {Number(balance).toFixed(4)}</p>
            {metamaskToken? <Button outline label={`Add ${metamaskToken.symbol} to Metamask`} onClick={addTokenToMetamask} /> : null}

            <Button label="Wrap" className='w-full' onClick={wrap} isLoading={isWrapping} />
            <Button outline label="Mint 100 BG" className='w-full' onClick={mintBG} isLoading={isMintingBG} />
        </>
    )
}

export default WrapForm