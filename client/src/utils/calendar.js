export function downloadBookingIcs(booking, hotel) {
  const cleanStart = booking?.checkInDate
    ? String(booking.checkInDate).split('T')[0].replace(/-/g, '')
    : '20261115';
  const cleanEnd = booking?.checkOutDate
    ? String(booking.checkOutDate).split('T')[0].replace(/-/g, '')
    : '20261116';

  const hotelName = hotel?.name || booking?.hotel?.name || 'StayHub Luxury Hotel';
  const hotelCity = hotel?.city || booking?.hotel?.city || 'India';
  const bookingId = booking?._id ? String(booking._id).slice(-8).toUpperCase() : 'CONFIRMED';
  const rooms = booking?.roomsBooked || 1;
  const guests = booking?.guests || 2;
  const price = booking?.totalPrice ? `₹${Number(booking.totalPrice).toLocaleString('en-IN')}` : '';

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StayHub Hotels & Resorts//Reservation System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:stayhub-${bookingId}-${Date.now()}@stayhub.com`,
    `SUMMARY:Stay at ${hotelName} (StayHub Booking #${bookingId})`,
    `DESCRIPTION:Confirmed reservation for ${rooms} room(s) and ${guests} guest(s) at ${hotelName}. Total Price: ${price}. Managed via StayHub Real-Time Reservations.`,
    `LOCATION:${hotelName}, ${hotelCity}`,
    `DTSTART;VALUE=DATE:${cleanStart}`,
    `DTEND;VALUE=DATE:${cleanEnd}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: Upcoming stay at ${hotelName} tomorrow!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `StayHub_${hotelName.replace(/[^a-zA-Z0-9]/g, '_')}_#${bookingId}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
