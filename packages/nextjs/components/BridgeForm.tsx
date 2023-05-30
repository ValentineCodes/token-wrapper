import React from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import SelectNetwork from './SelectNetwork'
import { NumberInput } from '@chakra-ui/react'
import InputTokenAmount from './InputTokenAmount'

type Props = {}
function BridgeForm({}: Props) {
  return (
    <form className='bg-white text-black p-8 rounded-md shadow-md'>
        <h1 className='mb-10 text-2xl'>Bridge</h1>
        
        <div className='flex flex-col md:flex-row gap-5 items-center md:items-end'>
          <SelectNetwork img={{url: '/images/mumbai-icon.png', alt: 'mumbai'}} options={["Mumbai"]} onSelect={value => console.log(value)} />

          <div className=' font-bold bg-white rounded-md p-2 border border-gray-300 cursor-pointer transition duration-300 hover:border-[#624DE3] hover:text-white hover:bg-[#624DE3]'>
             <ArrowPathIcon className='w-5' />
          </div>

          <SelectNetwork img={{url: '/images/eth-icon.png', alt: 'sepolia'}} options={["Sepolia"]} onSelect={value => console.log(value)} />
        </div>

        <InputTokenAmount label='You send' tokens={["MATIC"]} onChange={token => console.log(token)} />
        <p className='text-right text-xs text-gray-700'>Balance: 25,400</p>
        <InputTokenAmount label='You receive' tokens={["MATICc"]} onChange={token => console.log(token)} />

        <button className="border border-[#624DE3] bg-[#624DE3] text-white hover:bg-white hover:text-[#624DE3] transition-all px-4 py-2 rounded-md shadow-lg w-full mt-5">Deposit</button>
    </form>
  )
}

export default BridgeForm