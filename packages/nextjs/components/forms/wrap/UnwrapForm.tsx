import React, {useState, useEffect} from 'react'
import { useSwitchNetwork, useChainId, useAccount, useSigner, erc20ABI } from 'wagmi'
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

const TOKENS = [
    {
        name: "ETHc",
        isNative: true,
        "address": "",
        cloneContract: "0xaFe79D30940218584ec95dFF49cCBB03aa8B3682",
        amount: 0
    },
    {
        name: "cMATICc",
        isNative: false,
        address: "0x10b9980C12DDC8B6b1d06C1d50B64f7d400CA0FD",
        cloneContract: "0xAb47256134F7653a3E7E5a5533732bD3B1AD6668",
        amount: 0
    }
]

type Props = {}
function UnwrapForm({}: Props) {
    const chainId = useChainId()
    const {switchNetwork} = useSwitchNetwork()
    const {data: signer, isLoading: isLoadingSigner} = useSigner()
    const {address: account, isConnected} = useAccount()

    const [network, setNetwork] = useState(NETWORKS[0])
    const [token, setToken] = useState(TOKENS[0])
    const [isUnwrapping, setIsUnwrapping] = useState(false)
    const [balance, setBalance] = useState("")

    const {data: ethClone, isLoading: isLoadingETHClone} = useDeployedContractInfo("ETHClone")
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

        setIsUnwrapping(true)
        let notificationId
        const amount = ethers.utils.parseEther(token.amount.toString())
        let contract
        if(token.isNative) {
            contract = new ethers.Contract(token.cloneContract, ethClone?.abi, signer)

        } else {
            contract = new ethers.Contract(token.cloneContract, erc20TokenClone?.abi, signer)
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
        (async () => {
            if(isLoadingSigner || !isConnected) return
            try {
                const _token = new ethers.Contract(token.cloneContract, erc20ABI, signer)
                const balance = await _token.balanceOf(account)
                setBalance(Number(ethers.utils.formatEther(balance)).toFixed(4))
            } catch(error) {
                console.log(`Error reading balance of ${token.name}`)
                console.error(error)
                return
            }
        })()
    }, [token, account, isUnwrapping])
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
            {chainId !== network.chainId && <Button label="Switch Network" className="w-full" onClick={() => switchNetwork?.(network.chainId)} />}

            <NumberInput className='flex mt-7'>
            <NumberInputField className='w-full border border-gray-300 pl-2' placeholder='Amount' value={token.amount || ""} onChange={e => setToken(token => ({...token, amount: Number(e.target.value)}))} />
            <div className='w-[180px]'>
                <Select defaultValue={TOKENS?.[0].name} className='w-[50px]' onChange={handleTokenChange}>
                    {TOKENS?.map(token =>  <option key={token.cloneContract} value={token.cloneContract}>{token.name}</option>)}
                </Select>
            </div>
            </NumberInput>
            <p className='text-right text-sm text-gray-700'>Balance: {balance}</p>

            <Button label="Unwrap" className='w-full' onClick={unwrap} isLoading={isUnwrapping} />
        </>
    )
}

export default UnwrapForm