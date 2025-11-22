// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    // role: "user" or "vendor"
    role: {
      type: String,
      enum: ["user", "vendor"],
      required: true,
      default: "user",
    },

    // vendor-specific fields (nullable for normal users)
    businessName: { type: String },
    serviceType: { type: [String] }, // e.g. ["salon", "plumbing"]
    address: { type: String },

    // models/user.js (snippet)
    profilePic: {
      url: { type: String },
      public_id: { type: String } // optional - useful if you need delete
    },

    // NEW: approval & documents for vendor onboarding
    isApproved: { type: Boolean, default: false }, // vendor must be approved by admin
    documents: [
      {
        filename: String,
        url: String, // if you store files in S3/local etc.
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    tasks: [
      {
        type: mongoose.Types.ObjectId,
        ref: "task",
      },
    ],
  },
  { timestamps: true }
);

// Ensure vendors provide serviceType(s)
userSchema.pre("validate", function (next) {
  if (this.role === "vendor") {
    if (!this.serviceType || this.serviceType.length === 0) {
      this.invalidate(
        "serviceType",
        "Vendors must specify at least one serviceType."
      );
    }
    // you can add other required checks for vendors here
  }
  next();
});

module.exports = mongoose.model("user", userSchema);
