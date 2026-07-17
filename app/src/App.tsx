import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParkingData } from '@/hooks/useParkingData';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import ParkingMap from '@/components/ParkingMap';
import SpotDetail from '@/components/SpotDetail';
import ReservationPanel from '@/components/ReservationPanel';
import LoginModal from '@/components/LoginModal';
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
  } = useParkingData();

  // Admin auth state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Panel / Modal states
  const [showReservation, setShowReservation] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

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

  // Guard for admin-only actions
  const requireAdmin = (action: () => void) => {
    if (isAdmin) {
      action();
    } else {
      setShowLogin(true);
      setShowLoginPrompt(true);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ backgroundColor: '#e8e0d6' }}>
      {/* Sidebar */}
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
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          currentFloorName={currentFloorData.name}
          onRefresh={simulateRealtimeUpdates}
          occupancyRate={stats.occupancyRate}
          isAdmin={isAdmin}
          onOpenReservation={() => requireAdmin(() => setShowReservation(true))}
          onOpenLogin={() => setShowLogin(true)}
        />

        <div className="flex-1 p-4 min-w-0 min-h-0">
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

      {/* Spot Detail Modal */}
      <SpotDetail
        spot={selectedSpot}
        onClose={handleCloseDetail}
        onToggleStatus={(id) => requireAdmin(() => toggleSpotStatus(id))}
        onSetStatus={(id, status) => requireAdmin(() => setSpotStatus(id, status))}
        zoneColors={ZONE_COLORS}
        isAdmin={isAdmin}
        onLoginClick={() => setShowLogin(true)}
      />

      {/* Reservation Panel (slides from right) */}
      <ReservationPanel
        isOpen={showReservation}
        onClose={() => setShowReservation(false)}
        availableSpots={availableSpots}
        onReserve={(id, plate, hours) => reserveSpot(id, plate, hours)}
        zoneColors={ZONE_COLORS}
        isAdmin={isAdmin}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={handleLoginSuccess}
        showPrompt={showLoginPrompt}
      />
    </div>
  );
}

export default App;
