import React from 'react'
import { useNavigate } from "react-router-dom";

const Billing = () => {

  const navigate = useNavigate();

  return (
    <div className='pl-10'>

      <p className='text-5xl mb-10 mt-5'>
        Billing
      </p>

      <div >
        <button
          onClick={() => navigate("/billing/invoice/search")}
          className='border py-3 px-3 w-25 text-center border-gray-700 rounded-2xl'>
          Search Invoice
        </button>

        <button
          onClick={() => navigate("/billing/invoice/new")}
          className='border py-3 px-3 w-25 text-center border-gray-700 rounded-2xl'>
          New Invoice
        </button>
      </div>


    </div>
  )
}

export default Billing