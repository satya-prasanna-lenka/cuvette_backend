const { json } = require("express");
// const { UserControle } = require("../models");
const jwt = require("jsonwebtoken");
const User = require("../models/userModal");
const Interview = require("../models/interviewSchema");
const transporter = require("../utils/sendMail");

const twilio = require("twilio");
// const client = new twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// Twilio setup
const accountSid = process.env.ACCOUNTSID;
const authToken = process.env.TAWILIOAUTH;

const client = new twilio(accountSid, authToken);

const getUser = async (req, res, next) => {
  const userDetails = await Registration.find();
  res.send({ message: "not finding any data" });
};

// Signup user
const createUser = async (req, res, next) => {
  const { name, phoneNumber, companyName, companyEmail, employeeSize } =
    req.body;

  try {
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this Phone already exists" });
    }
    const newUser = new User({
      name,
      phoneNumber,
      companyName,
      companyEmail,
      employeeSize,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// sendOtp
const sendOtp = async (req, res, next) => {
  const { email, phoneNumber } = req.body;

  try {
    // Find user by email or phone number
    const user = await User.findOne({
      $or: [{ companyEmail: email }, { phoneNumber: phoneNumber }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTPs for phone and email
    const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Update OTPs and expiration times in the database
    user.phoneOtp = phoneOtp;
    user.emailOtp = emailOtp;
    user.phoneOtpExpiration = otpExpiration;
    user.emailOtpExpiration = otpExpiration;
    await user.save();

    // Send OTP to phone number (Twilio)
    const formattedPhoneNumber = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+91${phoneNumber}`; // Or adjust the country code accordingly

    try {
      const message = await client.messages.create({
        body: `Your OTP for phone verification is ${phoneOtp}`,
        from: process.env.PHONENUMBER,
        to: formattedPhoneNumber,
      });

      console.log(`OTP sent successfully to phone number: ${message.sid}`);
    } catch (error) {
      console.error("Error sending OTP to phone number:", error);
      return res
        .status(500)
        .json({ message: "Failed to send OTP to phone number" });
    }

    // Send OTP to email (Nodemailer)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for email verification",
      text: `Your OTP for email verification is ${emailOtp}`,
    });

    res
      .status(200)
      .json({ message: "OTPs sent to both email and phone number" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTPs", error });
  }
};

// verifyOtp;

const verifyOtp = async (req, res, next) => {
  const { email, phoneNumber, emailOtp, phoneOtp } = req.body;

  try {
    // Find user by email or phone number
    let user = await User.findOne({
      $or: [{ companyEmail: email }, { phoneNumber: phoneNumber }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let emailVerified = false;
    let phoneVerified = false;

    // Validate Email OTP if provided
    if (emailOtp) {
      if (emailOtp === user.emailOtp && Date.now() < user.emailOtpExpiration) {
        emailVerified = true;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid or expired email OTP" });
      }
    }

    // Validate Phone OTP if provided
    if (phoneOtp) {
      if (phoneOtp === user.phoneOtp && Date.now() < user.phoneOtpExpiration) {
        phoneVerified = true;
      } else {
        return res
          .status(400)
          .json({ message: "Invalid or expired phone OTP" });
      }
    }

    // Check if both OTPs are verified
    if (emailVerified && phoneVerified) {
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.companyEmail, phone: user.phoneNumber },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      return res.status(200).json({
        message: "Both OTPs verified, token created",
        emailVerified,
        phoneVerified,
        token,
      });
    }

    // Return which OTPs are verified
    return res.status(200).json({
      message: "Partial verification",
      emailVerified,
      phoneVerified,
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error });
  }
};

const testUser = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(400).json({ message: "User dose not exist" });
  }
  res.status(200).json({ message: "Success", name: user.name });
};

const addInterview = async (req, res, next) => {
  const { jobTitle, jobDescription, experienceLevel, candidates, endDate } =
    req.body;

  try {
    // Create the interview
    const interview = new Interview({
      createdBy: req.user.id,
      jobTitle,
      jobDescription,
      experienceLevel,
      candidates,
      endDate,
    });

    // Save to database
    await interview.save();

    // Send emails to each candidate
    await sendInterviewEmails(candidates, jobTitle, jobDescription, endDate);

    res.status(200).json({
      message: "Interview created and emails sent successfully",
      interview,
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    res.status(500).json({ message: "Error creating interview", error });
  }
};

// Function to send emails to all candidates
const sendInterviewEmails = async (
  candidates,
  jobTitle,
  jobDescription,
  endDate
) => {
  for (let i = 0; i < candidates.length; i++) {
    const email = candidates[i].email;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Job Interview for ${jobTitle}`,
      text: `Dear Candidate,

You have been shortlisted for the job interview for the position of ${jobTitle}. 

Job Description: 
${jobDescription}

Interview Date: ${new Date(endDate).toLocaleDateString()}

Please confirm your availability.

Best Regards,
Company Name`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  }
};

module.exports = {
  getUser,
  createUser,
  sendOtp,
  verifyOtp,
  testUser,
  addInterview,
};
