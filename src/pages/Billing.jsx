import React from 'react'
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, Plus } from 'lucide-react'

const Billing = () => {

  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center'>
    <div className=''>

      <div className=" mx-auto">
        <h1 className="text-4xl text-center font-bold text-gray-900 mt-8">Billing</h1>

        <div className='border mt-10 border-gray-600 py-6 px-8 w-fit gap-3 flex flex-col rounded-md'>
          <p className='font-semibold text-3xl'>INVOICE</p>
          <div className='flex flex-col gap-3'>

            <button
              onClick={() => navigate("/billing/invoice/search")}
              className='bg-[#3480fb] border-1 py-3 px-6 text-white text-center border-gray-700 rounded-xl'>
              <div className='flex gap-2'>
                <SearchIcon />
                <p>Search Invoice</p>

              </div>
            </button>

            <button
              onClick={() => navigate("/billing/invoice/new")}
              className='border-2 py-3 px-6  text-center rounded-xl border-[#3480fb] text-[#3571d2] font-semibold'>
              <div className='flex gap-2'>
                <Plus />
                <p>
                  New Invoice

                </p>


              </div>
            </button>
          </div>
        </div>


      </div>
    </div>
    </div>
  )
}

export default Billing