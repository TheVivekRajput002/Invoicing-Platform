import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Invoice from './page/Invoice'

function App() {


  return (
    <div className='bg-[#F9FAFB]'>
      <div className='py-8'>
        <Header />
      </div>

      <Invoice />


    </div>
  )
}

export default App
