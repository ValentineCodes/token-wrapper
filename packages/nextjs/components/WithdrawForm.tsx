import React, {useState} from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import SelectNetwork from './SelectNetwork'
import InputTokenAmountForm from './InputTokenAmountForm'

const SEPOLIA_TOKENS_CLONES = ["ETHc"]
const MUMBAI_TOKENS_CLONES = ["MATICc"]

type Props = {}
function WithdrawForm({}: Props) {
  const [isNetworkSwitched, setIsNetworkSwitched] = useState(false)
  return (
      <>  
        <div className={`flex ${isNetworkSwitched? "flex-col": "flex-col-reverse"} ${isNetworkSwitched? "md:flex-row": "md:flex-row-reverse"} gap-5 items-center md:items-end`}>
          <SelectNetwork img={{url: '/images/eth-icon.png', alt: 'sepolia'}} options={["Sepolia"]} onSelect={value => console.log(value)} />
          
          <div className='font-bold bg-white rounded-md p-2 border border-gray-300 cursor-pointer transition duration-300 hover:border-[#624DE3] hover:text-white hover:bg-[#624DE3]' onClick={() => setIsNetworkSwitched(!isNetworkSwitched)}>
             <ArrowPathIcon className='w-5' />
          </div>

          <SelectNetwork img={{url: '/images/mumbai-icon.png', alt: 'mumbai'}} options={["Mumbai"]} onSelect={value => console.log(value)} />
        </div>

        <InputTokenAmountForm tokens={isNetworkSwitched? MUMBAI_TOKENS_CLONES : SEPOLIA_TOKENS_CLONES} amount='' onChange={token => console.log(token)} />
        <p className='text-right text-sm text-gray-700'>Balance: 25,400</p>

        <button className="border border-[#624DE3] bg-[#624DE3] text-white hover:bg-white hover:text-[#624DE3] transition-all px-4 py-2 rounded-md shadow-lg w-full mt-5">Withdraw</button>
      </>
  )
}

export default WithdrawForm