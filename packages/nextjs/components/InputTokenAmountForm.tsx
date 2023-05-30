import { NumberInput, NumberInputField, Select } from '@chakra-ui/react';
import React, {useEffect, useState} from 'react'


interface Token {
    name: string;
    amount: number
}
type Props = {
    label?: string;
    tokens: string[];
    amount: string;
    onChange: (token: Token) => void;
}

function InputTokenAmountForm({label, tokens, amount, onChange}: Props) {

    const [token, setToken] = useState<Token>({name: tokens[0].toLowerCase(), amount: 0})

    const handleAmoutChange = (amount: number) => {
        if(!isNaN(amount)) {
            setToken(token => ({...token, amount}))
        }
    }

    useEffect(() => {
        onChange(token)
    }, [token])

  return (
    <div className='mt-5'>
        <label className='text-gray-700 text-sm'>{label}</label>
        <NumberInput className='flex mt-2'>
            <NumberInputField placeholder='Amount' value={amount} onChange={e => handleAmoutChange(Number(e.target.value))} />
            <div className='w-[180px]'>
                <Select defaultValue={tokens[0].toLowerCase()} className='w-[50px]' onChange={e => setToken(token => ({...token, name: e.target.value}))}>
                    {tokens.map(token =>  <option value={token.toLowerCase()}>{token}</option>)}
                </Select>
            </div>
        </NumberInput>
    </div>
  )
}

export default InputTokenAmountForm