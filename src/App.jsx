import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// import Search from './pages/Search';
import Billing from './pages/Billing';
import NewInvoice from './pages/NewInvoice';
import Data from './pages/Data';
import EditCustomer from './pages/EditCustomer';
import Header from './components/Header';
import ViewEditInvoice from './pages/ViewEditInvoice';
import CustomerSearch from './pages/CustomerSearch';
import InvoiceSearch from './pages/InvoiceSearch';
import ProductSearch from './pages/ProductSearch';
import Staff from './pages/Staff';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 md:ml-16 pb-20 md:pb-0">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/billing' element={<Billing />} />
            <Route path='/customer/search' element={<CustomerSearch />} />
            <Route path='/product/search' element={<ProductSearch />} />
            <Route path='/data' element={<Data />} />
            <Route path='/staff' element={<Staff />} />
            {/* <Route path='/search' element={<Search />} /> */}

            <Route path='/billing/invoice/search' element={<InvoiceSearch />} />
            <Route path='/billing/invoice/new' element={<NewInvoice />} />
            {/* <Route path='/customer' element={<Customer />} /> */}

            <Route path='/billing/invoice/:id' element={<ViewEditInvoice />} />
            <Route path='/customer/edit/:id' element={<EditCustomer />} />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;


