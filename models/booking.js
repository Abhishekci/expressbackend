// models/booking.js
const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Types.ObjectId, ref: "service", required: true },
    user: { type: mongoose.Types.ObjectId, ref: "user", required: true }, // who booked
    vendor: { type: mongoose.Types.ObjectId, ref: "user", required: true }, // service owner
    scheduledAt: { type: Date, required: true }, // when the booking is scheduled
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    price: { type: Number, default: 0 }, // copy from service at time of booking
    notes: { type: String }, // any user notes
  },
  { timestamps: true }
);

module.exports = mongoose.model("booking", BookingSchema);
