import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingModal from './components/BookingModal';
import PixModal from './components/PixModal';
import LoginModal from './components/LoginModal';

function MainApp() {
  const { user, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('home'); // home, accessories, customer, admin

  // Booking Flow States
  const [selectedConsoleForBooking, setSelectedConsoleForBooking] = useState(null);
  const [initialPeriodForBooking, setInitialPeriodForBooking] = useState('weekend');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activePixBooking, setActivePixBooking] = useState(null);

  // Login Modal State
  const [loginModalMode, setLoginModalMode] = useState(null); // 'login' or 'register' or null

  const handleStartBooking = (consoleItem, period = 'weekend') => {
    if (!user) {
      setLoginModalMode('login');
      return;
    }
    setSelectedConsoleForBooking(consoleItem);
    setInitialPeriodForBooking(period);
    setShowBookingModal(true);
  };

  const handleBookingCreated = (booking) => {
    setShowBookingModal(false);
    if (booking.payment_method === 'pix') {
      setActivePixBooking(booking);
    } else {
      setCurrentView('customer');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="bg-ambient-grid" />

      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenLogin={(mode) => setLoginModalMode(mode)}
      />

      <main style={{ flex: 1 }}>
        {currentView === 'home' && (
          <Home
            onSelectConsole={handleStartBooking}
            onOpenAccessories={() => setCurrentView('accessories')}
          />
        )}

        {currentView === 'accessories' && (
          <Catalog onRentConsole={handleStartBooking} />
        )}

        {currentView === 'customer' && (
          <CustomerDashboard />
        )}

        {currentView === 'admin' && isAdmin && (
          <AdminDashboard />
        )}
      </main>

      <Footer />
      <NotificationToast />

      {/* Booking Wizard Modal */}
      {showBookingModal && (
        <BookingModal
          consoleItem={selectedConsoleForBooking}
          initialPeriod={initialPeriodForBooking}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingCreated}
        />
      )}

      {/* PIX Payment Modal */}
      {activePixBooking && (
        <PixModal
          booking={activePixBooking}
          onClose={() => {
            setActivePixBooking(null);
            setCurrentView('customer');
          }}
          onSuccess={() => {
            setActivePixBooking(null);
            setCurrentView('customer');
          }}
        />
      )}

      {/* Login / Register Modal */}
      {loginModalMode && (
        <LoginModal
          initialMode={loginModalMode}
          onClose={() => setLoginModalMode(null)}
          onSuccess={() => {
            setLoginModalMode(null);
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
