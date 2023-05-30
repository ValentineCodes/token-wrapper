import React from 'react'

type Props = {
    label: string;
    className?: string;
    onClick: () => void
}

function Button({label, className, onClick}: Props) {
  return (
    <button className={`border border-[#624DE3] bg-[#624DE3] text-white hover:bg-white hover:text-[#624DE3] transition-all px-4 py-2 rounded-md shadow-lg w-full mt-5 ${className}`} onClick={onClick}>{label}</button>
  )
}

export default Button