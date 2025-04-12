import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CafeRegistrationForm from './pages/CafeRegistrationForm';
import MenuUpload from './pages/MenuUpload';
import CafeLoginForm from './pages/CafeLoginForm';
import ManagerLoginForm from './pages/ManagerLoginForm';
import OrderUser from './pages/OrderUser';
import GetQR from './pages/GetQR';
import OrderPanelAdmin from './pages/OrderPanelAdmin';
import CartPage from './pages/CartPage';
import CategoryWiseDishes from './pages/CategoryWiseDishes';
import UserPage from './pages/UserPage';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT ROUTE */}
        <Route path="/" element={<CafeLoginForm />} />

        {/* CAFE REGISTRATION & MENU MANAGEMENT */}
        <Route path="register" element={<CafeRegistrationForm />} />
        
        {/* PROTECTED MENU ROUTES */}
        <Route path="menu/:cafeId">
          <Route index element={
              <ProtectedRoute>
                <MenuUpload />
              </ProtectedRoute>
            }
          />
          <Route path="getQR" element={
              <ProtectedRoute>
                <GetQR />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* USER ORDERING (PUBLIC ROUTES) */}
        <Route path="order/:cafeId/:tableId/:customer">
          <Route index element={<OrderUser />} />
          <Route path=":category" element={<CategoryWiseDishes />} />
          <Route path="cart" element={<CartPage />} />
        </Route>

        {/* USER INFORMATION (PUBLIC ROUTE) */}
        <Route path="userInfo/:cafeId/:tableId" element={<UserPage />} />

        {/* ROOT ROUTE */}
        <Route path="/manager" element={<ManagerLoginForm />} />

        {/* ADMIN ORDER PANEL (PROTECTED ROUTE) */}
        <Route
          path="admin/:cafeId"
          element={
            <ProtectedRoute>
              <OrderPanelAdmin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
