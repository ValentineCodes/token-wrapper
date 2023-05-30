import React from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import SelectNetwork from './SelectNetwork'

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
    </form>
  )
}

export default BridgeForm