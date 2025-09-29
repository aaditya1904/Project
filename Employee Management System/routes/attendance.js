// routes/admin.js
import express from "express";
import employee from '../models/userModel.js';
import attendanceModel from '../models/attendanceModel.js';

const router = express.Router();

router.get('/attendance/:id', async (req, res) => {
  try {
    const empId = req.params.id;

    // Fetch the employee
    const emp = await employee.findById(empId);
    if (!emp) return res.status(404).send("User not found");

    // Find all attendance records for this employee by ID
    const attendanceRecords = await attendanceModel
      .find({ user: empId })  // <- This is the important fix
      .sort({ date: 1 });

    res.render('attendanceView', { employee: emp, attendance: attendanceRecords });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching attendance');
  }
});

export default router;
