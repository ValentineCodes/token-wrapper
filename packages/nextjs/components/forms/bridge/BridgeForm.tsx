import React, {useState, useEffect} from 'react'
import { useSwitchNetwork, useChainId, useAccount, useSigner } from 'wagmi'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import SelectNetwork from '../../SelectNetwork'
import InputTokenAmountForm from './InputTokenAmountForm'
import Button from '../../Button'
import { Select } from '@chakra-ui/react'
import { useAccountBalance } from '~~/hooks/scaffold-eth'
import { ethers } from 'ethers'
import { notification } from '~~/utils/scaffold-eth'

const ETHEREUM_NETWORKS = [{
  name: "Sepolia",
  chainId: 11155111
}]
const POLYGON_NETWORKS = [{
  name: "Mumbai",
  chainId: 80001
}]

export interface BridgeVault {
  name: string;
  address: string;
}
interface TokenClone {
  name: string;
  address: string;
}

const SEPOLIA_VAULTS = [{name: "ETH", address: ""}]
const MUMBAI_VAULTS = [{name: "MATIC", address: "0x737dD6121643a37bcCB542eB8b0085583fa7350e"}]
const SEPOLIA_TOKENS_CLONES = [{name: "ETHc", address: ""}]
const MUMBAI_TOKENS_CLONES = [{name: "MATICc", address: ""}]

type Props = {}
function BridgeForm({}: Props) {
  const [isNetworkSwitched, setIsNetworkSwitched] = useState(false)
  const [networkChainId, setNetworkChainId] = useState({layer1: ETHEREUM_NETWORKS[0].chainId, layer2: POLYGON_NETWORKS[0].chainId})
  const [selectedChainId, setSelectedChainId] = useState(ETHEREUM_NETWORKS[0].chainId)
  const [token, setToken] = useState({vault: "", amount: 0})
  const [receivedTokens, setReceivedTokens] = useState<TokenClone[] | null>(null)
  const {switchNetwork} = useSwitchNetwork()
  const {address: account, isConnected} = useAccount()
  const {balance, isLoading: isLoadingBalance} = useAccountBalance(account)
  const chainId = useChainId()
  const {data: signer, isLoading: isLoadingSigner} = useSigner()
  const [isDepositing, setIsDepositing] = useState(false)

  const deposit = async () => {
    if(isDepositing) return
    if(!isConnected) {
      notification.info("Connect Wallet")
      return
    }
    if(isLoadingSigner || isLoadingBalance) {
      notification.info("Loading resources...")
      return
    }
    if(token.amount <= 0) {
      notification.warning("Invalid amount!")
      return
    }
    if(token.amount > balance!) {
      notification.error("Amount cannot exceed balance!")
      return
    }

    let notificationId = notification.loading("Depositing")
    setIsDepositing(true)
    try {
      const tx = await signer?.sendTransaction({
        to: token.vault,
        value: ethers.utils.parseEther(String(token.amount))
      })
      await tx?.wait(1)
      notification.success("Successful Deposit")
    } catch(error) {
      notification.error(JSON.stringify(error))
    } finally{
      notification.remove(notificationId)
      setIsDepositing(false)
    }
  }

  useEffect(() => {
    if(isNetworkSwitched){
      setSelectedChainId(networkChainId.layer2)
      setReceivedTokens(MUMBAI_TOKENS_CLONES)
    } else {
      setSelectedChainId(networkChainId.layer1)
      setReceivedTokens(SEPOLIA_TOKENS_CLONES)
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

        <InputTokenAmountForm label="You send" vaults={isNetworkSwitched? MUMBAI_VAULTS : SEPOLIA_VAULTS} value={String(token.amount)} onChange={token => setToken(token)} />
        <div className='flex justify-between items-center text-sm text-gray-700'>
          <p>1% fee</p>
          <p>Balance: {balance?.toFixed(3)}</p>
        </div>

        <div className='mt-5'>
          <label className='text-gray-700 text-sm'>You receive</label>
          <div className='flex mt-2'>
              <input className='w-full border border-gray-300 pl-2' placeholder='Amount' value={token.amount - (token.amount / 100) || ""} disabled />
              <div className='w-[180px]'>
                  <Select defaultValue={receivedTokens?.[0].address.toLowerCase()} className='w-[50px]'>
                      {receivedTokens?.map(token =>  <option key={token.name} value={token.address}>{token.name}</option>)}
                  </Select>
              </div>
          </div>
        </div>

        <Button label="Deposit" onClick={deposit} isLoading={isDepositing} />
      </>
  )
}

export default BridgeForm