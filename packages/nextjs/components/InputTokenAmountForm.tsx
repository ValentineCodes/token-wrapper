import { NumberInput, NumberInputField, Select } from '@chakra-ui/react';
import React, {useEffect, useState} from 'react'
import { BridgeVault } from './BridgeForm';


interface Token {
    vault: string;
    amount: number
}
type Props = {
    label?: string;
    vaults: BridgeVault[];
    value: string;
    onChange?: (token: Token) => void;
}

function InputTokenAmountForm({label, vaults, value, onChange}: Props) {
    const [token, setToken] = useState<Token>({vault: vaults[0].address, amount: 0})

    useEffect(() => {
        onChange?.(token)
    }, [token])

    useEffect(() => {
        setToken(token => ({...token, vault: vaults[0].address}))
    }, [vaults])

  return (
    <div className='mt-5'>
        <label className='text-gray-700 text-sm'>{label}</label>
        <NumberInput className='flex mt-2'>
            <NumberInputField className='w-full border border-gray-300 pl-2' placeholder='Amount' value={value} onChange={e => setToken(token => ({...token, amount: Number(e.target.value)}))} />
            <div className='w-[180px]'>
                <Select defaultValue={vaults[0].address} className='w-[50px]' onChange={e => setToken(token => ({...token, vault: e.target.value}))}>
                    {vaults.map(vault =>  <option key={vault.name} value={vault.address}>{vault.name}</option>)}
                </Select>
            </div>
        </NumberInput>
    </div>
  )
}

export default InputTokenAmountForm