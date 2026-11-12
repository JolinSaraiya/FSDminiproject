const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Hotel is required'],
    },
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
      validate: {
        validator(value) {
          return !this.checkInDate || value > this.checkInDate;
        },
        message: 'Check-out date must be after check-in date',
      },
    },
    roomsBooked: {
      type: Number,
      required: [true, 'Rooms booked is required'],
      min: [1, 'Must book at least 1 room'],
      validate: {
        validator: Number.isInteger,
        message: 'Rooms booked must be a whole number',
      },
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest is required'],
      validate: {
        validator: Number.isInteger,
        message: 'Guests must be a whole number',
      },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['confirmed', 'cancelled'],
        message: 'Status must be confirmed or cancelled',
      },
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Booking', bookingSchema);

