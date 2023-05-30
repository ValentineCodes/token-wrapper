import React from 'react'
import { Select } from '@chakra-ui/react'

interface Img {
  url: string;
  alt: string;
}
type Props = {
  img: Img;
  options: string[],
  onSelect: (network: string) => void;
}

function SelectNetwork({img, options, onSelect}: Props) {
  return (
    <div className='flex flex-col items-center space-y-10 w-60' aria-label='network'>
        <div className='flex justify-center item-center shadow-[0_0_5px_3px_#624DE3] p-2 rounded-3xl'>
          <img src={img.url} alt={img.alt} className='w-16 h-16' />
        </div>

        <Select onChange={(e) => onSelect(e.target.value)} defaultValue={options[0].toLowerCase()}>
          {options.map(option =>  <option value={option.toLowerCase()}>{option}</option>)}
        </Select>
    </div>
  )
}

export default SelectNetwork