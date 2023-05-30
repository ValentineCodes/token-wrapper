import React, {useState, useEffect} from 'react'
import { useSwitchNetwork, useChainId } from 'wagmi'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import SelectNetwork from './SelectNetwork'
import InputTokenAmountForm from './InputTokenAmountForm'
import Button from './Button'

const ETHEREUM_NETWORKS = [{
  name: "Sepolia",
  chainId: 11155111
}]
const POLYGON_NETWORKS = [{
  name: "Mumbai",
  chainId: 80001
}]

const SEPOLIA_TOKENS = ["ETH"]
const MUMBAI_TOKENS = ["MATIC"]
const SEPOLIA_TOKENS_CLONES = ["ETHc"]
const MUMBAI_TOKENS_CLONES = ["MATICc"]

type Props = {}
function BridgeForm({}: Props) {
  const [isNetworkSwitched, setIsNetworkSwitched] = useState(false)
  const {switchNetwork} = useSwitchNetwork()
  const chainId = useChainId()
  const [networkChainId, setNetworkChainId] = useState({layer1: ETHEREUM_NETWORKS[0].chainId, layer2: POLYGON_NETWORKS[0].chainId})
  const [selectedChainId, setSelectedChainId] = useState(ETHEREUM_NETWORKS[0].chainId)

  useEffect(() => {
    if(isNetworkSwitched){
      setSelectedChainId(networkChainId.layer2)
    } else {
      setSelectedChainId(networkChainId.layer1)
    }
  }, [networkChainId, isNetworkSwitched])

  return (
      <>  
        <div className={`flex ${isNetworkSwitched? "flex-col-reverse": "flex-col"} ${isNetworkSwitched? "md:flex-row-reverse": "md:flex-row"} gap-5 items-center md:items-end`}>
          <SelectNetwork img={{url: '/images/eth-icon.png', alt: 'ethereum'}} networks={ETHEREUM_NETWORKS} onSelect={(chainId: number) => setNetworkChainId(networkChainId => ({...networkChainId, layer1: chainId}))} />

          <div className='font-bold bg-white rounded-md p-2 border border-gray-300 cursor-pointer transition duration-300 hover:border-[#624DE3] hover:text-white hover:bg-[#624DE3]' onClick={() => setIsNetworkSwitched(!isNetworkSwitched)}>
             <ArrowPathIcon className='w-5' />
          </div>

          <SelectNetwork img={{url: '/images/polygon-icon.png', alt: 'polygon'}} networks={POLYGON_NETWORKS} onSelect={(chainId: number) => setNetworkChainId(networkChainId => ({...networkChainId, layer2: chainId}))} />
        </div>
        {chainId !== selectedChainId && <Button label="Switch Network" className="w-full" onClick={() => switchNetwork?.(selectedChainId)} />}

        <InputTokenAmountForm label="You send" tokens={isNetworkSwitched? MUMBAI_TOKENS : SEPOLIA_TOKENS} amount='' onChange={token => console.log(token)} />
        <div className='flex justify-between items-center text-sm text-gray-700'>
          <p>1% fee</p>
          <p>Balance: 25,400</p>
        </div>
            
        <InputTokenAmountForm label="You receive" tokens={isNetworkSwitched? MUMBAI_TOKENS_CLONES : SEPOLIA_TOKENS_CLONES} amount='' onChange={token => console.log(token)} />

        <Button label="Deposit" onClick={() => true} />
      </>
  )
}

export default BridgeForm