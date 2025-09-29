import express from "express";
import userModel from "../models/userModel.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("signin"); 
});


router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await userModel.findOne({ email });

    if (!employee) {
      return res.status(404).send("User not found");
    }

    if (employee.password !== password) {
      return res.status(401).send("Invalid credentials");
    }

    res.cookie("userId", employee._id.toString(), {
      httpOnly: true,       
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "lax",       // Basic CSRF protection
      secure: false          // Set to true in production with HTTPS
    });

    res.redirect(`/user/${employee._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
