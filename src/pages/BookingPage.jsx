import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // 4. Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [newBookingForm, setNewBookingForm] = useState({
    purpose: '',
    startStr: '09:00 AM',
    endStr: '10:00 AM'
  });

  const gridContainerRef = useRef(null);

  // Automatically scroll grid to show relevant start times on resource/date change
  useEffect(() => {
    if (gridContainerRef.current) {
      const earliestStart = activeBookings.length > 0 
        ? Math.min(...activeBookings.map(b => b.start)) 
        : 8.0;
      // Scroll to 1 hour before the earliest start time, clamped to the top
      const scrollToHour = Math.max(0, earliestStart - 1);
      gridContainerRef.current.scrollTo({
        top: scrollToHour * hourHeight,
        behavior: 'smooth'
      });
    }
  }, [selectedResource, activeDate]);

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

  // Fetch bookings dynamically from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('resource', selectedResource)
          .eq('booking_date', activeDateStr);

        if (error) {
          console.error('Error fetching bookings:', error.message);
        } else if (data) {
          const formattedData = data.map(b => ({
            id: b.id,
            resource: b.resource,
            date: b.booking_date,
            start: parseFloat(b.start_time),
            end: parseFloat(b.end_time),
            title: b.title,
            timeStr: b.time_str,
            isConflict: b.is_conflict,
            detail: b.detail
          }));
          setBookings(formattedData);
        }
      } catch (err) {
        console.error('Failed to query bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [selectedResource, activeDateStr]);

  // Filtered bookings for current Resource and Date
  const activeBookings = bookings.filter(
    (b) => b.resource === selectedResource && b.date === activeDateStr
  );

  // Sort activeBookings by start time, then by end time
  const sortedBookings = [...activeBookings].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return a.end - b.end;
  });

  // Group bookings into clusters of overlapping events
  const clusters = [];
  let currentCluster = [];
  let currentEnd = 0;

  sortedBookings.forEach((booking) => {
    if (booking.start >= currentEnd) {
      if (currentCluster.length > 0) {
        clusters.push(currentCluster);
      }
      currentCluster = [booking];
      currentEnd = booking.end;
    } else {
      currentCluster.push(booking);
      if (booking.end > currentEnd) {
        currentEnd = booking.end;
      }
    }
  });
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Assign columns within each cluster to avoid overlaps
  clusters.forEach((cluster) => {
    const clusterCols = [];
    cluster.forEach((booking) => {
      let placed = false;
      for (let i = 0; i < clusterCols.length; i++) {
        // Check if booking overlaps with any booking already in column i
        const hasOverlap = clusterCols[i].some(
          (b) => booking.start < b.end && booking.end > b.start
        );
        if (!hasOverlap) {
          clusterCols[i].push(booking);
          booking.colIndex = i;
          placed = true;
          break;
        }
      }
      if (!placed) {
        booking.colIndex = clusterCols.length;
        clusterCols.push([booking]);
      }
    });
    // Store the total columns count in the cluster for width calculations
    cluster.forEach((booking) => {
      booking.totalCols = clusterCols.length;
    });
  });

  // Time formatting helper (e.g. 9.5 -> "09:30 AM")
  const formatDecimalTime = (decimal) => {
    const hours24 = Math.floor(decimal);
    const mins = Math.round((decimal - hours24) * 60);
    const ampm = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
  };

  // Parse time select option value to decimal hour (e.g. "09:30 AM" -> 9.5)
  const parseTimeToDecimal = (timeStr, isEndTime = false) => {
    if (timeStr === '12:00 AM (Next Day)') return 24.0;
    const [time, ampm] = timeStr.split(' ');
    const [hours, mins] = time.split(':').map(Number);
    let decimal = hours === 12 ? 0 : hours;
    if (ampm === 'PM') decimal += 12;
    decimal += mins / 60;
    return decimal;
  };

  // Timeline Hours (0 to 23 representing 12:00 AM to 11:00 PM)
  const HOURS = Array.from({ length: 24 }, (_, i) => i);
  const hourHeight = 80;

  // Generate options for the start/end time selectors in the modal
  const startOptions = [];
  const endOptions = [];
  for (let h = 0; h < 24; h++) {
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const padH = String(h12).padStart(2, '0');
    
    startOptions.push(`${padH}:00 ${ampm}`);
    startOptions.push(`${padH}:30 ${ampm}`);
    
    endOptions.push(`${padH}:00 ${ampm}`);
    endOptions.push(`${padH}:30 ${ampm}`);
  }
  const filteredEndOptions = [
    ...endOptions.slice(1),
    '12:00 AM (Next Day)'
  ];

  // Handle slot booking form submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const { purpose, startStr, endStr } = newBookingForm;
    if (!purpose.trim()) return alert('Please enter a team name/purpose.');

    const startDec = parseTimeToDecimal(startStr, false);
    const endDec = parseTimeToDecimal(endStr, true);

    if (startDec >= endDec) {
      return alert('End time must be after the start time.');
    }

    // Check for scheduling overlaps/conflicts
    const overlapExists = activeBookings.some((b) => {
      return !b.isConflict && (startDec < b.end) && (endDec > b.start);
    });

    const isConflict = overlapExists;
    const finalTitle = overlapExists ? `Requested ${startStr} - ${endStr}` : `Booked - ${purpose}`;
    const detail = overlapExists ? 'Conflict - Slot is unavailable' : '';

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          {
            resource: selectedResource,
            booking_date: activeDateStr,
            start_time: startDec,
            end_time: endDec,
            title: finalTitle,
            time_str: `${startStr} - ${endStr}`,
            is_conflict: isConflict,
            detail: detail,
            booked_by_id: 1 // default test employee
          }
        ])
        .select();

      if (error) {
        alert('Failed to book slot: ' + error.message);
      } else if (data && data[0]) {
        const savedBooking = {
          id: data[0].id,
          resource: data[0].resource,
          date: data[0].booking_date,
          start: parseFloat(data[0].start_time),
          end: parseFloat(data[0].end_time),
          title: data[0].title,
          timeStr: data[0].time_str,
          isConflict: data[0].is_conflict,
          detail: data[0].detail
        };
        setBookings([...bookings, savedBooking]);
        setShowBookingModal(false);
        setNewBookingForm({ purpose: '', startStr: '09:00 AM', endStr: '10:00 AM' });

        if (overlapExists) {
          alert('Scheduling Conflict! Your requested slot overlaps with an existing booking and has been flagged in red.');
        } else {
          alert('Success! Your resource slot has been booked.');
        }
      }
    } catch (err) {
      console.error('Error saving booking:', err);
      alert('Failed to save booking. Please try again.');
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
        
        {/* Scrollable Container for 24-hour timeline */}
        <div 
          ref={gridContainerRef}
          className="w-full overflow-y-auto max-h-[500px] pr-2 relative"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#CBD5E1 transparent'
          }}
        >
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
              {sortedBookings.map((slot) => {
                // Calculate top offset and height based on decimal start and end times
                const top = slot.start * hourHeight;
                const height = (slot.end - slot.start) * hourHeight;

                // Calculate positioning based on overlapping columns
                let leftStyle = '0px';
                let widthStyle = 'calc(100% - 16px)';
                if (slot.totalCols > 1) {
                  leftStyle = `calc((100% - 16px) * ${slot.colIndex} / ${slot.totalCols})`;
                  widthStyle = `calc((100% - 16px) / ${slot.totalCols} - 6px)`;
                }
                
                // Icon representation
                const SlotIcon = slot.isConflict ? ClockIcon : UsersIcon;

                // Card styling depending on slot duration
                const isShort = height < 50;
                const paddingClass = isShort ? 'py-1 px-2.5 gap-2' : 'p-3.5 gap-3';

                return (
                  <div
                    key={slot.id}
                    className={`absolute rounded-xl flex text-left transition-all duration-300 shadow-xs border ${paddingClass} ${
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
                    {!isShort && (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        slot.isConflict ? 'bg-red-100 text-alert-red-text' : 'bg-[#FFF4EF] text-primary-orange'
                      }`}>
                        <SlotIcon size={16} strokeWidth={2.4} />
                      </div>
                    )}
                    <div className="flex flex-col flex-grow min-w-0 justify-center">
                      <div className={`text-xs font-extrabold truncate ${slot.isConflict ? 'text-alert-red-text' : 'text-primary-orange'}`}>
                        {slot.title}
                      </div>
                      <div className="text-[11px] font-bold text-text-secondary mt-0.5 truncate">{slot.timeStr}</div>
                      {!isShort && slot.detail && (
                        <div className="text-[10px] font-extrabold text-alert-red-text mt-1.5 truncate">
                          {slot.detail}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

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
                    {startOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
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
                    {filteredEndOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
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
