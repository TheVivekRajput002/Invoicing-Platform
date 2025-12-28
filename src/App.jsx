import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Billing from './pages/Billing';
import Invoice from './pages/Invoice';
import Data from './pages/Data';
import EditCustomer from './pages/EditCustomer';
import Header from './components/Header';
import EditInvoice from './pages/EditInvoice';

function App() {
  return (
    <div>


    <BrowserRouter>

    <div className='py-6'>
      <Header />

    </div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/search' element={<Search />} />
        <Route path='/billing' element={<Billing />} />
        <Route path='/billing/invoice' element={<Invoice />} />


        <Route path="/customer/edit/:id" element={<EditCustomer />} />
        <Route path="/invoice/edit/:id" element={<EditInvoice />} />

        <Route path='/data' element={<Data />} />
      </Routes>
    </BrowserRouter>

    </div>


  );
}

export default App;
