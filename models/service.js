// models/service.js
const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    serviceType: {
      // e.g. "salon", "plumbing"
      type: String,
      required: true,
      index: true,
    },
    price: {
      // optional price (number)
      type: Number,
      default: 0,
    },
    durationMins: {
      // optional duration in minutes
      type: Number,
      default: 30,
    },
    active: {
      // soft-delete / hide flag
      type: Boolean,
      default: true,
    },

    // gallery images for this service
    images: [
      {
        url: { type: String },
        public_id: { type: String }, // optional - Cloudinary public_id
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("service", ServiceSchema);
