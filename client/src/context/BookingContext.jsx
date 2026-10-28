import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  // Global search filters
  const [searchParams, setSearchParams] = useState({
    type: 'All',
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    search: '',
    minPrice: '',
    maxPrice: '',
  });

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Booking modal state
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);

  const showToast = (title, message, type = 'info') => {
    setToast({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const closeToast = () => setToast(null);

  const openBookingModal = (room) => {
    setSelectedRoomForBooking(room);
  };

  const closeBookingModal = () => {
    setSelectedRoomForBooking(null);
  };

  const updateSearchParams = (newParams) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
  };

  const clearFilters = () => {
    setSearchParams({
      type: 'All',
      checkInDate: '',
      checkOutDate: '',
      guests: 1,
      search: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  return (
    <BookingContext.Provider
      value={{
        searchParams,
        updateSearchParams,
        clearFilters,
        toast,
        showToast,
        closeToast,
        selectedRoomForBooking,
        openBookingModal,
        closeBookingModal,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
