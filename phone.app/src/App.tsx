import { useCallback, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParkingData } from '@/hooks/useParkingData';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ParkingMap from '@/components/ParkingMap';
import SpotDetail from '@/components/SpotDetail';
import ReservationPanel from '@/components/ReservationPanel';
import LoginModal from '@/components/LoginModal';
import ManagementPanel from '@/components/ManagementPanel';
import './App.css';

function App() {
  const {
    floors,
    currentFloor,
    setCurrentFloor,
    currentFloorData,
    filteredSpots,
    availableSpots,
    stats,
    selectedSpot,
    setSelectedSpot,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    toggleSpotStatus,
    setSpotStatus,
    reserveSpot,
    simulateRealtimeUpdates,
    ZONE_COLORS,
    currentFloorSpots,
  } = useParkingData();

  // Admin auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Panel / Modal states
  const [showReservation, setShowReservation] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showManagement, setShowManagement] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const floorOptions = floors.map(f => ({ id: f.id, name: f.name }));

  const handleCloseDetail = useCallback(() => {
    setSelectedSpot(null);
  }, [setSelectedSpot]);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowLogin(false);
    setShowLoginPrompt(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const requireAdmin = (action: () => void) => {
    if (isAdmin) {
      action();
    } else {
      setShowLoginPrompt(true);
      setShowLogin(true);
    }
  };

  // Close sidebar on route/resize change for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ backgroundColor: '#e8e0d6' }}>
      {/* ── Desktop Sidebar (always visible on lg+) ── */}
      <div className="hidden lg:block">
        <Sidebar
          floors={floorOptions}
          currentFloor={currentFloor}
          onFloorChange={setCurrentFloor}
          stats={stats}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          isAdmin={isAdmin}
          onOpenManagement={() => setShowManagement(true)}
          isMobile={false}
        />
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="lg:hidden fixed inset-0 z-[60]"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[70] w-72"
              style={{ backgroundColor: '#5A6460' }}
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
            >
              <Sidebar
                floors={floorOptions}
                currentFloor={currentFloor}
                onFloorChange={(f) => { setCurrentFloor(f); setSidebarOpen(false); }}
                stats={stats}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                isAdmin={isAdmin}
                onOpenManagement={() => { setShowManagement(true); setSidebarOpen(false); }}
                isMobile={true}
                onCloseMobile={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          currentFloorName={currentFloorData.name}
          onRefresh={simulateRealtimeUpdates}
          occupancyRate={stats.occupancyRate}
          isAdmin={isAdmin}
          onOpenReservation={() => setShowReservation(true)}
          onOpenLogin={() => setShowLogin(true)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="flex-1 p-2 lg:p-4 min-w-0 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFloor}
              className="w-full h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ParkingMap
                floor={currentFloorData}
                spots={filteredSpots}
                selectedSpot={selectedSpot}
                onSelectSpot={setSelectedSpot}
                zoneColors={ZONE_COLORS}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Modals & Panels ── */}
      <SpotDetail
        spot={selectedSpot}
        onClose={handleCloseDetail}
        onToggleStatus={(id) => requireAdmin(() => toggleSpotStatus(id))}
        onSetStatus={(id, status) => requireAdmin(() => setSpotStatus(id, status))}
        zoneColors={ZONE_COLORS}
        isAdmin={isAdmin}
        onLoginClick={() => setShowLogin(true)}
      />

      <ReservationPanel
        isOpen={showReservation}
        onClose={() => setShowReservation(false)}
        availableSpots={availableSpots}
        onReserve={(id, plate, hours) => reserveSpot(id, plate, hours)}
        zoneColors={ZONE_COLORS}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        showPrompt={showLoginPrompt}
      />

      <ManagementPanel
        isOpen={showManagement}
        onClose={() => setShowManagement(false)}
        spots={currentFloorSpots}
        zoneColors={ZONE_COLORS}
        onSetStatus={(id, status) => setSpotStatus(id, status)}
      />
    </div>
  );
}

export default App;
