import React, {useState, useEffect} from 'react'
import { useSwitchNetwork, useChainId, useAccount, useSigner } from 'wagmi'
import SelectNetwork from '../../SelectNetwork'
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
        name: "ETH",
        isNative: true,
        contract: "0xaFe79D30940218584ec95dFF49cCBB03aa8B3682",
        amount: 0
    },
    {
        name: "MATICc",
        isNative: false,
        contract: "0xd08c3672Af3085f109b345D29fe110447bC758D6",
        amount: 0
    }
]

type Props = {}
function WrapForm({}: Props) {
    const chainId = useChainId()
    const {switchNetwork} = useSwitchNetwork()

    const [network, setNetwork] = useState(NETWORKS[0])
    const [token, setToken] = useState(TOKENS[0])
    const [isWrapping, setIsWrapping] = useState(false)

    const handleNetworkChange = (e: any) => {
        const chainId = Number(e.target.value)
        const network = NETWORKS.find(network => network.chainId === chainId)
        setNetwork(network!)
    }

    const handleTokenChange = (e: any) => {
        const contract = e.target.value
        const token = TOKENS.find(network => network.contract === contract)
        setToken(_token => ({...token!, amount: _token.amount}))
    }

    const wrap = () => {
        
    }
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

            <NumberInput className='flex mt-2'>
            <NumberInputField className='w-full border border-gray-300 pl-2' placeholder='Amount' value={token.amount || ""} onChange={e => setToken(token => ({...token, amount: Number(e.target.value)}))} />
            <div className='w-[180px]'>
                <Select defaultValue={TOKENS?.[0].name} className='w-[50px]' onChange={handleTokenChange}>
                    {TOKENS?.map(token =>  <option key={token.contract} value={token.contract}>{token.name}</option>)}
                </Select>
            </div>
            </NumberInput>
            <p className='text-right text-sm text-gray-700'>Balance: </p>

            <Button label='Wrap' className='w-full' onClick={() => console.log("Wrapping...")} isLoading={isWrapping} />
        </>
    )
}

export default WrapForm