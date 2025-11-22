// routes/user.js
const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authenticationToken = require('./auth'); 

// Sign up API (sign-in in your naming)
router.post("/sign-in", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      phone,
      role = "user",
      businessName,
      serviceType,
      address,
      profilePic 
    } = req.body;

    // Basic validations
    if (!username || username.length < 4) {
      return res
        .status(400)
        .json({ message: "username must be at least 4 characters" });
    }
    if (!email) return res.status(400).json({ message: "email is required" });
    if (!password || password.length < 6)
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters" });
    if (!phone) return res.status(400).json({ message: "phone is required" });

    // check existing username or email
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "username or email already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      phone,
      password: hashPass,
      role,
      // vendor fields (only set if role === 'vendor')
      businessName: role === "vendor" ? businessName : undefined,
      serviceType: role === "vendor" ? serviceType : undefined,
      address: role === "vendor" ? address : undefined,
      // auto-approve vendor accounts
      isApproved: role === "vendor" ? true : false,
      profilePic: profilePic ? { url: profilePic, public_id: null } : undefined
    });

    await newUser.save();
    return res.status(201).json({ message: "signup successful" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login API
// Login API (replace the existing router.post("/log-in", ...))
router.post("/log-in", async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // allow login by email or username; prefer email if provided
    const query = email ? { email } : { username };
    const existingUser = await User.findOne(query);
    if (!existingUser) {
      return res.status(400).json({ message: "user not exists" });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    // create token payload consistent with other code: { user: { id, role } }
    const payload = { user: { id: existingUser._id, role: existingUser.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || "abhi", {
      expiresIn: "2d",
    });

    // include isApproved in response so frontend knows vendor approval state
    return res.status(200).json({
      id: existingUser._id,
      token,
      role: existingUser.role,
      isApproved: existingUser.isApproved || false,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/v1/user/me
router.get('/me', authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // find user and exclude password
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// PATCH /api/v1/profile-pic
// Body: { profilePic: { url: string, public_id?: string } } OR { profilePicUrl: "..." }
router.patch("/profile-pic", authenticationToken, async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { profilePic, profilePicUrl } = req.body;

    // Accept either { profilePic: { url, public_id } } or { profilePicUrl: "..." }
    const newPic = profilePic
      ? { url: profilePic.url, public_id: profilePic.public_id || null }
      : profilePicUrl
      ? { url: profilePicUrl, public_id: null }
      : null;

    if (!newPic) return res.status(400).json({ message: "profilePic or profilePicUrl required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // For demo: we won't delete old Cloudinary file automatically (optional later)
    user.profilePic = { url: newPic.url, public_id: newPic.public_id || null };
    await user.save();

    return res.status(200).json({ message: "Profile picture updated", profilePic: user.profilePic });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
