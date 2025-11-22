// routes/booking.js
const router = require("express").Router();
const Booking = require("../models/booking");
const Service = require("../models/service");
const User = require("../models/user");

// use your existing auth middleware that sets req.user = { id, role }
// adjust require path if your middleware is in a different folder
const authenticationToken = require("./auth");

/**
 * POST /api/v1/booking/create
 * Body: { serviceId, scheduledAt, notes }
 * Only authenticated users (role === 'user') should create bookings
 */
router.post("/create", authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // allow both users & vendors to book
    if (user.role !== "user" && user.role !== "vendor") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { serviceId, scheduledAt, notes } = req.body;
    if (!serviceId || !scheduledAt)
      return res
        .status(400)
        .json({ message: "serviceId and scheduledAt required" });

    const service = await Service.findById(serviceId);
    if (!service || !service.active)
      return res.status(404).json({ message: "Service not found or inactive" });

    // prevent vendor booking their own service
    if (user.role === "vendor" && String(service.vendor) === String(userId)) {
      return res
        .status(400)
        .json({ message: "Vendors cannot book their own service" });
    }

    const booking = new Booking({
      service: service._id,
      user: userId,
      vendor: service.vendor,
      scheduledAt: new Date(scheduledAt),
      price: service.price || 0,
      notes,
    });

    const saved = await booking.save();

    return res.status(201).json({
      message: "Booking created",
      booking: saved,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET /api/v1/booking/my-bookings
 * Authenticated user lists own bookings
 */
router.get("/my-bookings", authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const bookings = await Booking.find({ user: userId })
      .populate(
        "service vendor",
        "title serviceType businessName username email"
      )
      .sort({ scheduledAt: -1 });
    return res.status(200).json({ data: bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * GET /api/v1/booking/vendor-bookings
 * Authenticated vendor lists bookings for their services
 */
router.get("/vendor-bookings", authenticationToken, async (req, res) => {
  try {
    const vendorId = req.user && req.user.id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const vendor = await User.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    if (vendor.role !== "vendor")
      return res
        .status(403)
        .json({ message: "Only vendors can view vendor bookings" });

    const bookings = await Booking.find({ vendor: vendorId })
      .populate("service user", "title username email")
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: bookings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * PUT /api/v1/booking/:id/respond
 * Body: { action } where action is "accept" or "reject"
 * Only vendor owning booking can accept/reject
 */
router.put("/:id/respond", authenticationToken, async (req, res) => {
  try {
    const vendorId = req.user && req.user.id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== "vendor")
      return res
        .status(403)
        .json({ message: "Only vendors can respond to bookings" });

    const bookingId = req.params.id;
    const { action } = req.body;
    if (!["accept", "reject"].includes(action))
      return res
        .status(400)
        .json({ message: "action must be accept or reject" });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (String(booking.vendor) !== String(vendorId))
      return res
        .status(403)
        .json({ message: "Not authorized to respond to this booking" });

    booking.status = action === "accept" ? "accepted" : "rejected";
    await booking.save();

    return res
      .status(200)
      .json({ message: `Booking ${booking.status}`, booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
