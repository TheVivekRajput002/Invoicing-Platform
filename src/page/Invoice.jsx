import React from 'react'
import { useState,useEffect } from 'react'
import Input from '../components/Input';

const Invoice = () => {

    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [dateTime, setDateTime] = useState('');

    useEffect(() => {
        // Get current date and time in the format required by datetime-local input
        // Format: YYYY-MM-DDTHH:MM
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        setDateTime(currentDateTime);
    }, []);

    return (
        <>
            <div >

                <p className='font-bold text-3xl text-center mt-4'>Invoice</p>

                <div className='min-h-screen m-3 bg-[#FFFFFF] rounded-t-4xl py-10 px-8 border-[#E5E7EB] border flex flex-col' >

                    <div className='flex flex-col gap-5'>

                        <Input id="name" type="text" value={name} fxn={(e) => { setName(e.target.value); console.log(name) }} placeholder="Customer Name" />
                        <Input id="Address" type="text" value={address} fxn={(e) => { setAddress(e.target.value); console.log(address) }} placeholder="Customer Address" />
                        <Input id="number" type="number" value={number} fxn={(e) => { setNumber(e.target.value); console.log(number) }} placeholder="Phone Number" />
                        <Input id="date_time" type="datetime-local" value={dateTime} fxn={(e) => { setDateTime(e.target.value); console.log(number) }} placeholder="Date & Time" />


                    </div>



                </div>

            </div>
        </>
    )
}

export default Invoice