import React, { useState } from 'react';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ClockIcon,
  UsersIcon,
  InfoIcon
} from '../components/Icons';

export default function BookingPage() {
  // 1. Resource Selector State
  const [selectedResource, setSelectedResource] = useState('Conference Room 2');

  // 2. Active Date State (Defaults to Tuesday, 7 Jul 2026)
  const [activeDate, setActiveDate] = useState(new Date('2026-07-07'));

  // 3. Bookings Registry State
  const [bookings, setBookings] = useState([
    // Tue, 7 Jul 2026: Conference Room 2
    { id: 1, resource: 'Conference Room 2', date: '2026-07-07', start: 9.0, end: 10.0, title: 'Booked - Procurement Team', timeStr: '09:00 AM - 10:00 AM', isConflict: false, detail: '' },
    { id: 2, resource: 'Conference Room 2', date: '2026-07-07', start: 9.5, end: 10.5, title: 'Requested 9:30 AM - 10:30 AM', timeStr: '09:30 AM - 10:30 AM', isConflict: true, detail: 'Conflict - Slot is unavailable' },
    
    // Tue, 7 Jul 2026: Projector B
    { id: 3, resource: 'Projector B', date: '2026-07-07', start: 11.0, end: 12.5, title: 'Booked - Marketing Team', timeStr: '11:00 AM - 12:30 PM', isConflict: false, detail: '' },
    
    // Tue, 7 Jul 2026: Training Room 1
    { id: 4, resource: 'Training Room 1', date: '2026-07-07', start: 13.0, end: 14.0, title: 'Booked - HR Training', timeStr: '01:00 PM - 02:00 PM', isConflict: false, detail: '' }
  ]);

  // 4. Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    purpose: '',
    startStr: '09:00 AM',
    endStr: '10:00 AM'
  });

  // Date Formatting Helper (e.g. "Tue, 7 Jul 2026")
  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Convert Date object to date string "YYYY-MM-DD"
  const getDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Increment Date
  const handleNextDay = () => {
    const next = new Date(activeDate);
    next.setDate(next.getDate() + 1);
    setActiveDate(next);
  };

  // Decrement Date
  const handlePrevDay = () => {
    const prev = new Date(activeDate);
    prev.setDate(prev.getDate() - 1);
    setActiveDate(prev);
  };

  const activeDateStr = getDateString(activeDate);

  // Filtered bookings for current Resource and Date
  const activeBookings = bookings.filter(
    (b) => b.resource === selectedResource && b.date === activeDateStr
  );

  // Time formatting helper (e.g. 9.5 -> "09:30 AM")
  const formatDecimalTime = (decimal) => {
    const hours24 = Math.floor(decimal);
    const mins = Math.round((decimal - hours24) * 60);
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
  };

  // Parse time select option value to decimal hour (e.g. "09:30 AM" -> 9.5)
  const parseTimeToDecimal = (timeStr) => {
    const [time, ampm] = timeStr.split(' ');
    const [hours, mins] = time.split(':').map(Number);
    let decimal = hours === 12 ? 0 : hours;
    if (ampm === 'PM') decimal += 12;
    decimal += mins / 60;
    return decimal;
  };

  // Timeline Hours
  const HOURS = [9, 10, 11, 12, 13, 14]; // 9 AM to 2 PM (14.0 is 2 PM)
  const hourHeight = 80;

  // Handle slot booking form submit
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const { purpose, startStr, endStr } = newBookingForm;
    if (!purpose.trim()) return alert('Please enter a team name/purpose.');

    const startDec = parseTimeToDecimal(startStr);
    const endDec = parseTimeToDecimal(endStr);

    if (startDec >= endDec) {
      return alert('End time must be after the start time.');
    }

    // Check for scheduling overlaps/conflicts
    const overlapExists = activeBookings.some((b) => {
      return !b.isConflict && (startDec < b.end) && (endDec > b.start);
    });

    const newBooking = {
      id: Date.now(),
      resource: selectedResource,
      date: activeDateStr,
      start: startDec,
      end: endDec,
      title: overlapExists ? `Requested ${startStr} - ${endStr}` : `Booked - ${purpose}`,
      timeStr: `${startStr} - ${endStr}`,
      isConflict: overlapExists,
      detail: overlapExists ? 'Conflict - Slot is unavailable' : ''
    };

    setBookings([...bookings, newBooking]);
    setShowBookingModal(false);
    setNewBookingForm({ purpose: '', startStr: '09:00 AM', endStr: '10:00 AM' });

    if (overlapExists) {
      alert('Scheduling Conflict! Your requested slot overlaps with an existing booking and has been flagged in red.');
    } else {
      alert('Success! Your resource slot has been booked.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* 1. Header Resource & Date Controls */}
      <div className="flex justify-between items-center gap-4 flex-wrap pb-1">
        
        {/* Left Side: Resource dropdown selection */}
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <span className="absolute left-4 top-3 text-text-secondary">
              <CalendarIcon size={18} />
            </span>
            <select
              value={selectedResource}
              className="w-full border border-border-color bg-white pl-11 pr-10 py-3 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-orange text-text-primary appearance-none cursor-pointer"
              onChange={(e) => setSelectedResource(e.target.value)}
            >
              <option value="Conference Room 2">Conference Room 2</option>
              <option value="Projector B">Projector B</option>
              <option value="Training Room 1">Training Room 1</option>
            </select>
            <span className="absolute right-4 top-3.5 text-text-secondary pointer-events-none">
              <ChevronDownIcon size={16} />
            </span>
          </div>
        </div>

        {/* Right Side: Date navigate buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Active Date display */}
          <div className="flex items-center gap-2 bg-white border border-border-color py-2.5 px-4 rounded-xl text-sm font-bold text-text-primary shadow-sm select-none">
            <CalendarIcon size={16} className="text-primary-orange" />
            <span>{formatDate(activeDate)}</span>
          </div>

          {/* Increment/Decrement Buttons */}
          <button 
            className="w-10 h-10 rounded-xl border border-border-color bg-white flex items-center justify-center transition hover:bg-bg-gray text-text-secondary hover:text-text-primary cursor-pointer"
            onClick={handlePrevDay} 
            aria-label="Previous day"
          >
            <ChevronLeftIcon size={16} />
          </button>
          <button 
            className="w-10 h-10 rounded-xl border border-border-color bg-white flex items-center justify-center transition hover:bg-bg-gray text-text-secondary hover:text-text-primary cursor-pointer"
            onClick={handleNextDay} 
            aria-label="Next day"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      {/* 2. Schedule Grid Card */}
      <div className="bg-white border border-border-color rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="relative border-l border-border-color ml-24" style={{ height: `${HOURS.length * hourHeight}px` }}>
          
          {/* Hour grid lines */}
          {HOURS.map((hr, idx) => (
            <div 
              key={idx} 
              className="relative border-t border-border-color border-dashed first:border-t-0 w-full"
              style={{ height: `${hourHeight}px` }}
            >
              <span className="absolute right-full mr-4 -top-3.5 text-[11px] font-bold text-text-secondary text-right select-none w-20">
                {formatDecimalTime(hr)}
              </span>
            </div>
          ))}

          {/* Overlapping Slot items */}
          <div className="absolute inset-0">
            {activeBookings.map((slot) => {
              // Calculate top offset and height based on decimal start and end times
              const top = (slot.start - 9.0) * hourHeight;
              const height = (slot.end - slot.start) * hourHeight;

              // Visual overlap handling: conflict cards are offset slightly to the right (left: 60px)
              const leftStyle = slot.isConflict ? '60px' : '0px';
              const widthStyle = slot.isConflict ? 'calc(100% - 70px)' : 'calc(100% - 16px)';
              
              // Icon representation
              const SlotIcon = slot.isConflict ? ClockIcon : UsersIcon;

              return (
                <div
                  key={slot.id}
                  className={`absolute rounded-xl p-4 flex gap-3 text-left transition-all duration-300 shadow-xs border ${
                    slot.isConflict 
                      ? 'bg-red-50 border-alert-red-border/40 border-dashed text-alert-red-text' 
                      : 'bg-primary-orange-light border-primary-orange-border/30 text-text-primary'
                  }`}
                  style={{
                    top: `${top}px`,
                    height: `${height - 4}px`, // Slight subtraction to provide a margin gap
                    left: leftStyle,
                    width: widthStyle
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    slot.isConflict ? 'bg-red-100 text-alert-red-text' : 'bg-[#FFF4EF] text-primary-orange'
                  }`}>
                    <SlotIcon size={18} strokeWidth={2.4} />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <div className={`text-xs font-extrabold ${slot.isConflict ? 'text-alert-red-text' : 'text-primary-orange'}`}>
                      {slot.title}
                    </div>
                    <div className="text-[11px] font-bold text-text-secondary mt-0.5">{slot.timeStr}</div>
                    {slot.detail && (
                      <div className="text-[10px] font-extrabold text-alert-red-text mt-1.5">
                        {slot.detail}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Dynamic Booking Button */}
        <div className="pt-2">
          <button
            className="bg-primary-orange hover:bg-primary-orange-hover text-white text-sm font-extrabold py-3 px-6 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-2"
            onClick={() => setShowBookingModal(true)}
          >
            <CalendarIcon size={16} /> Book a slot
          </button>
        </div>
      </div>

      {/* 3. Disclaimer Footer Banner */}
      <div className="bg-primary-orange-light border border-primary-orange-border/20 rounded-2xl p-4 flex items-center gap-3">
        <div className="text-primary-orange flex items-center shrink-0">
          <InfoIcon size={20} strokeWidth={2.4} />
        </div>
        <p className="text-xs font-semibold text-primary-orange leading-relaxed m-0">
          You can view your bookings and requests in Reports &gt; My Bookings.
        </p>
      </div>

      {/* 4. Slot booking Overlay Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form className="bg-white border border-border-color rounded-2xl shadow-xl max-w-md w-full overflow-hidden flex flex-col gap-5 p-6" onSubmit={handleBookingSubmit}>
            <div className="flex justify-between items-center pb-3 border-b border-border-color">
              <h3 className="font-heading text-base font-extrabold text-text-primary">Book Resource Slot</h3>
              <button 
                type="button" 
                className="text-text-secondary hover:text-text-primary text-xl font-bold transition cursor-pointer"
                onClick={() => setShowBookingModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Team / Purpose</label>
              <input
                type="text"
                required
                placeholder="e.g. Sales, Frontend sync"
                className="border border-border-color rounded-xl px-4 py-2.5 bg-white text-sm focus:outline-none focus:border-primary-orange text-text-primary font-medium"
                value={newBookingForm.purpose}
                onChange={(e) => setNewBookingForm({ ...newBookingForm, purpose: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Start Time</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-text-secondary">
                    <ClockIcon size={16} />
                  </span>
                  <select
                    value={newBookingForm.startStr}
                    className="w-full border border-border-color bg-white pl-11 pr-10 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-orange text-text-primary appearance-none cursor-pointer"
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, startStr: e.target.value })}
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                  </select>
                  <span className="absolute right-4 top-3 text-text-secondary pointer-events-none">
                    <ChevronDownIcon size={14} />
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">End Time</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-text-secondary">
                    <ClockIcon size={16} />
                  </span>
                  <select
                    value={newBookingForm.endStr}
                    className="w-full border border-border-color bg-white pl-11 pr-10 py-2.5 rounded-xl text-sm font-semibold focus:outline-none focus:border-primary-orange text-text-primary appearance-none cursor-pointer"
                    onChange={(e) => setNewBookingForm({ ...newBookingForm, endStr: e.target.value })}
                  >
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                  </select>
                  <span className="absolute right-4 top-3 text-text-secondary pointer-events-none">
                    <ChevronDownIcon size={14} />
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-color mt-2">
              <button 
                type="button" 
                className="border border-border-color bg-white hover:bg-bg-gray text-text-primary text-xs font-extrabold py-2.5 px-5 rounded-xl transition cursor-pointer"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="bg-primary-orange hover:bg-primary-orange-hover text-white text-xs font-extrabold py-2.5 px-6 rounded-xl transition shadow-sm cursor-pointer">
                Book Slot
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
