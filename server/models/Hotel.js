const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true,
      minlength: [2, 'Hotel name must be at least 2 characters'],
      maxlength: [120, 'Hotel name cannot exceed 120 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: [2, 'City must be at least 2 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [1, 'Price per night must be at least 1'],
    },
    totalRooms: {
      type: Number,
      required: [true, 'Total rooms is required'],
      min: [1, 'Total rooms must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Total rooms must be a whole number',
      },
    },
    availableRooms: {
      type: Number,
      required: [true, 'Available rooms is required'],
      min: [0, 'Available rooms cannot be negative'],
      validate: [
        {
          validator: Number.isInteger,
          message: 'Available rooms must be a whole number',
        },
        {
          validator(value) {
            if (typeof this.totalRooms === 'number') {
              return value <= this.totalRooms;
            }
            if (typeof this.getUpdate === 'function') {
              const update = this.getUpdate();
              const total = update.$set?.totalRooms ?? update.totalRooms;
              return typeof total === 'number' ? value <= total : true;
            }
            return true;
          },
          message: 'Available rooms cannot exceed total rooms',
        },
      ],
    },
    amenities: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    gradient: {
      type: String,
      default: 'from-indigo-600 to-violet-600',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Hotel', hotelSchema);

