import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { AdminLayout } from './pages/AdminLayout';
import { Dashboard } from './pages/Dashboard';
import { UsersList } from './pages/UsersList';
import { VendorsList } from './pages/VendorsList';
import { OrdersList } from './pages/OrdersList';
import { HubsList } from './pages/HubsList';
import { FinanceList } from './pages/FinanceList';
import { SubAdminsList } from './pages/SubAdminsList';
import { SLAList } from './pages/SLAList';
import { TicketList } from './pages/TicketList';
import { SafetyConsole } from './pages/SafetyConsole';
import { CouponList } from './pages/CouponList';
import { InventoryOversight } from './pages/InventoryOversight';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersList />} />
            <Route path="vendors" element={<VendorsList />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="sla" element={<SLAList />} />
            <Route path="tickets" element={<TicketList />} />
            <Route path="hubs" element={<HubsList />} />
            <Route path="finance" element={<FinanceList />} />
            <Route path="coupons" element={<CouponList />} />
            <Route path="inventory" element={<InventoryOversight />} />
            <Route path="safety" element={<SafetyConsole />} />
            <Route path="subadmins" element={<SubAdminsList />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
