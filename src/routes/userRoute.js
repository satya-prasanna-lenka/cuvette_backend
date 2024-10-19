const express = require("express");
const {
  getUser,
  createUser,
  sendOtp,
  verifyOtp,
  testUser,
  addInterview,
} = require("../controller/userControler");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();

const path = require("path");
const authenticateToken = require("../middleware/authHandler");

router.get("/", async (req, res, next) => {
  try {
    const result = await getUser(req);

    return result;
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const result = await createUser(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post("/send-otp", async (req, res, next) => {
  try {
    const result = await sendOtp(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const result = await verifyOtp(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get("/test", authenticateToken, async (req, res, next) => {
  try {
    const result = await testUser(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post("/addInterview", authenticateToken, async (req, res, next) => {
  try {
    const result = await addInterview(req, res, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
