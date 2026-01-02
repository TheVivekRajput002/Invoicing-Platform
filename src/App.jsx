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
import StaffManage from './pages/StaffManage';
import ProductAdd from './pages/ProductAdd';
import Product from './pages/Product';
import TestPage from './pages/TestPage';
import ProductViewEdit from './pages/ProductViewEdit'
import CustomerViewEdit from './pages/CustomerViewEdit'
import Customer from './pages/Customer'
import CustomerAdd from './pages/CustomerAdd'
import EstimateAdd from './pages/EstimateAdd'
import EstimateSearch from './pages/EstimateSearch'

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
            <Route path='/customer' element={<Customer />} />
            <Route path='/customer/search' element={<CustomerSearch />} />
            <Route path='/customer/add' element={<CustomerAdd />} />
            <Route path='/product/search' element={<ProductSearch />} />
            <Route path='/data' element={<Data />} />
            <Route path='/staff' element={<StaffManage />} />
            <Route path='/product/add' element={<ProductAdd />} />
            <Route path='/product' element={<Product />} />

            <Route path='/billing/invoice/search' element={<InvoiceSearch />} />
            <Route path='/billing/invoice/new' element={<NewInvoice />} />

            <Route path='/billing/invoice/:id' element={<ViewEditInvoice />} />
            <Route path='/customer/edit/:id' element={<EditCustomer />} />
            <Route path='/test' element={<TestPage />} />
            <Route path="/product/:productId" element={<ProductViewEdit />} />
            <Route path="/customer/:customerId" element={<CustomerViewEdit />} />
            <Route path="/billing/estimate/add" element={<EstimateAdd />} />
            <Route path="/billing/estimate/search" element={<EstimateSearch />} />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;


