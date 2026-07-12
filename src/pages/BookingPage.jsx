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
      // Direct overlap overlap definition: (newStart < existingEnd) && (newEnd > existingStart)
      // and only check if it is not already a conflict card itself (we check overlaps against active bookings)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header Resource & Date Controls */}
      <div className="booking-controls-row">
        
        {/* Left Side: Resource dropdown selection */}
        <div className="booking-controls-left">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <div className="icon-select-input" style={{ width: '280px' }}>
              <span className="select-icon-left">
                <CalendarIcon size={18} />
              </span>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
              >
                <option value="Conference Room 2">Conference Room 2</option>
                <option value="Projector B">Projector B</option>
                <option value="Training Room 1">Training Room 1</option>
              </select>
              <span className="select-chevron-right">
                <ChevronDownIcon size={16} />
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Date navigate buttons */}
        <div className="booking-controls-right">
          {/* Active Date visual display */}
          <div className="date-display-box">
            <CalendarIcon size={16} className="calendar-icon" />
            <span>{formatDate(activeDate)}</span>
          </div>

          {/* Increment/Decrement Buttons */}
          <button className="pagination-btn" onClick={handlePrevDay} aria-label="Previous day">
            <ChevronLeftIcon size={16} />
          </button>
          <button className="pagination-btn" onClick={handleNextDay} aria-label="Next day">
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>

      {/* 2. Schedule Grid Card */}
      <div className="timeline-card">
        <div className="timeline-container">
          
          {/* Hour grid lines */}
          {HOURS.map((hr, idx) => (
            <div key={idx} className="timeline-hour-row">
              <span className="timeline-time-label">
                {formatDecimalTime(hr)}
              </span>
            </div>
          ))}

          {/* Overlapping Slot items */}
          <div className="booking-slot-container">
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
                  className={`booking-slot ${slot.isConflict ? 'conflict' : 'booked'}`}
                  style={{
                    top: `${top}px`,
                    height: `${height - 4}px`, // Slight subtraction to provide a margin gap between blocks
                    left: leftStyle,
                    width: widthStyle
                  }}
                >
                  <div className="slot-icon">
                    <SlotIcon size={18} strokeWidth={2.4} />
                  </div>
                  <div className="slot-content">
                    <div className="slot-title">{slot.title}</div>
                    <div className="slot-time">{slot.timeStr}</div>
                    {slot.detail && (
                      <div style={{ fontSize: '11px', fontWeight: '600', marginTop: '4px' }}>
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
        <div>
          <button
            className="btn-primary-orange"
            onClick={() => setShowBookingModal(true)}
            style={{ padding: '12px 24px', borderRadius: '12px' }}
          >
            <CalendarIcon size={16} /> Book a slot
          </button>
        </div>
      </div>

      {/* 3. Disclaimer Footer Banner */}
      <div className="info-banner">
        <div className="info-banner-icon">
          <InfoIcon size={20} strokeWidth={2.4} />
        </div>
        <p className="info-banner-text">
          You can view your bookings and requests in Reports &gt; My Bookings.
        </p>
      </div>

      {/* 4. Slot booking Overlay Modal */}
      {showBookingModal && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={handleBookingSubmit}>
            <div className="modal-header">
              <h3 className="modal-title">Book Resource Slot</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={() => setShowBookingModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Team / Purpose</label>
              <input
                type="text"
                required
                placeholder="e.g. Sales, Frontend sync"
                className="form-input"
                value={newBookingForm.purpose}
                onChange={(e) => setNewBookingForm({ ...newBookingForm, purpose: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <div className="icon-select-input">
                  <span className="select-icon-left">
                    <ClockIcon size={16} />
                  </span>
                  <select
                    value={newBookingForm.startStr}
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
                  <span className="select-chevron-right">
                    <ChevronDownIcon size={14} />
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <div className="icon-select-input">
                  <span className="select-icon-left">
                    <ClockIcon size={16} />
                  </span>
                  <select
                    value={newBookingForm.endStr}
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
                  <span className="select-chevron-right">
                    <ChevronDownIcon size={14} />
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowBookingModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Book Slot
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
