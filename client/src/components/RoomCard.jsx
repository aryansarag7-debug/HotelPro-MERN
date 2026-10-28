import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Wifi, Wind, Tv, Check, AlertCircle, Ban } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const RoomCard = ({ room }) => {
  const { openBookingModal } = useBooking();

  const isUnderMaintenance = !room.isAvailable;
  const isBookedForDates = room.isBookedForDates;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Image Container with Badges */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={room.image}
          alt={`Room ${room.roomNumber} - ${room.type}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

        {/* Room Number & Type Pills */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-900 shadow-sm backdrop-blur-sm">
            Room {room.roomNumber}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-600/90 text-white backdrop-blur-sm shadow-sm">
            {room.type}
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          {isUnderMaintenance ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md">
              <Ban className="w-3.5 h-3.5" /> Maintenance
            </span>
          ) : isBookedForDates ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
              <AlertCircle className="w-3.5 h-3.5" /> Booked for Dates
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-md">
              <Check className="w-3.5 h-3.5" /> Available
            </span>
          )}
        </div>

        {/* Capacity overlay */}
        <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow">
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>Up to {room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {room.description || 'Experience ultimate luxury and comfort with bespoke amenities and dedicated concierge service.'}
          </p>

          {/* Amenities Chips */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {(room.amenities || []).slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
            {(room.amenities || []).length > 3 && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md">
                +{room.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-2xl font-extrabold text-slate-900">
              ${room.pricePerNight}
            </span>
            <span className="text-xs text-slate-500 ml-1">/ night</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/rooms/${room._id}`}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Details
            </Link>

            <button
              onClick={() => openBookingModal(room)}
              disabled={isUnderMaintenance || isBookedForDates}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isUnderMaintenance || isBookedForDates
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 text-white hover:shadow-sky-500/25 shadow-md active:scale-95'
              }`}
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
