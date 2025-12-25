import React from 'react'

const Input = ({id,value, fxn, placeholder, type }) => {
    return (
        <div>
            <div className='relative'>
                <label
                    htmlFor={id}
                    className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all
                       peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3
                       peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500"
                >
                    {placeholder}
                </label>
                <input
                    type={type}
                    id={id}
                    value={value}
                    onChange={fxn}
                    className="peer w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-blue-500 transition-colors placeholder-transparent"
                    placeholder={placeholder}
                />
            </div>

        </div>
    )
}

export default Input