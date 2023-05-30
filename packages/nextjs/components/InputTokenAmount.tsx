import React from 'react'


interface Token {
    name: string;
    amount: number
}
type Props = {
    label: string;
    tokens: string[];
    onChange: (token: Token) => void;
}

function InputTokenAmount({label, tokens, onChange}: Props) {
  return (
    <div>InputTokenAmount</div>
  )
}

export default InputTokenAmount