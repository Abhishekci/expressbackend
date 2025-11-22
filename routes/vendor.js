// routes/vendor.js
const router = require("express").Router();
const User = require("../models/user");
const authenticationToken = require("./auth"); // same middleware you already use

// GET /api/v1/vendor/dashboard
router.get("/dashboard", authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "vendor") {
      return res.status(403).json({ message: "Forbidden: not a vendor" });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: "Vendor not approved yet" });
    }

    // return minimal vendor dashboard info (expand later)
    return res.status(200).json({
      message: "Welcome to vendor dashboard",
      vendor: {
        id: user._id,
        username: user.username,
        businessName: user.businessName,
        serviceType: user.serviceType,
        address: user.address,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
