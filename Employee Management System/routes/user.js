import express from "express";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import taskModel from "../models/tasksModel.js";
import attendanceModel from "../models/attendanceModel.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

// Middleware to protect user routes


router.get('/add', (req, res) => {
  res.render('user');
});

router.post('/add', async (req, res) => {
  try {
    const { name, email, number, password } = req.body;
    await userModel.create({ name, email, password, number });
    res.redirect('/admin');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Something went wrong!');
  }
});

router.get('/:id/tasks', checkAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('error', { message: 'Invalid ID format' });
    }

    const employee = await userModel.findById(req.params.id);
    if (!employee) return res.status(404).send('error', { message: 'Employee not found' });

    const tasks = await taskModel.find({ assignedTo: req.params.id });
    res.render('tasks', { employee, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).send('error', { message: 'Server error' });
  }
});


router.get('/:id/settings', checkAuth, async (req, res) => {
  let employee = await userModel.findById(req.params.id);
  res.render('settings', { employee});
})

router.post('/:id/settings', checkAuth, async (req, res) => {
  try {
    const empId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(empId)) {
      return res.status(400).render('error', { message: 'Invalid ID format' });
    }

    const currEmployee = await userModel.findById(empId);
    if (!currEmployee) return res.status(404).render('error', { message: 'Employee not found' });

    // Safely trim each field
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim();
    const number = (req.body.number || '').trim();
    const password = (req.body.password || '').trim();

    const updatedData = {
      name: name || currEmployee.name,
      email: email || currEmployee.email,
      number: number || currEmployee.number,
      password: password || currEmployee.password,
    };

    await userModel.findByIdAndUpdate(empId, updatedData);
    res.redirect(`/user/${empId}`);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Something went wrong!');
  }
});

router.get('/:id/attendance', checkAuth, async (req, res) => {
  try {
    const empId = req.params.id;
    const quarter = parseInt(req.query.q) || 1;

    if (!mongoose.Types.ObjectId.isValid(empId)) {
      return res.status(400).render('error', { message: 'Invalid ID format' });
    }

    const emp = await userModel.findById(empId);
    if (!emp) return res.status(404).render('error', { message: 'Employee not found' });

    const daysToShow = 30; // 30 days per month
    const skipDays = (quarter - 1) * daysToShow;

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() - skipDays);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (daysToShow - 1));

    // Format months
    const options = { month: 'long', year: 'numeric' };

    const startMonth = startDate.toLocaleDateString('en-US', options);
    const endMonth = endDate.toLocaleDateString('en-US', options);

    const allDays = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      allDays.push({ date: new Date(currentDate), status: null });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const records = await attendanceModel.find({
      user: new mongoose.Types.ObjectId(empId),
      date: { $gte: startDate, $lte: endDate }
    }).lean();

    records.forEach(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);

      const match = allDays.find(day => 
        day.date.getTime() === recordDate.getTime()
      );
      if (match && record.status) {
        match.status = record.status.toLowerCase();
      }
    });

    const presentCount = records.filter(r => r.status?.toLowerCase() === 'present').length;
    const absentCount = records.filter(r => r.status?.toLowerCase() === 'absent').length;
    const lateCount = records.filter(r => r.status?.toLowerCase() === 'late').length;

    res.render('attendance', {
      employee: emp,
      selectedQuarter: quarter,
      grid: allDays,
      presentCount,
      absentCount,
      lateCount,
      startMonth,
      endMonth // Pass the computed months to the template
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching attendance');
  }
});



// ✅ Dummy attendance seeder route (TEMPORARY)
router.get('/seed/attendance/:id', async (req, res) => {
  try {
    const empId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(empId)) {
      return res.status(400).send('Invalid ID');
    }

    const employee = await userModel.findById(empId);
    if (!employee) return res.status(404).send('User not found');

    // Clear existing attendance for the user
    await attendanceModel.deleteMany({ user: empId });

    // Generate 365 days of data (one year)
    const today = new Date();
    const dummyRecords = [];

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Randomly decide if there will be no attendance for some days
      const randomChance = Math.random();

      let status = null;
      if (randomChance < 0.8) { // 80% chance to have attendance data
        const statuses = ['present', 'absent', 'late'];
        status = statuses[Math.floor(Math.random() * statuses.length)];
      }

      dummyRecords.push({
        user: empId,
        date,
        status
      });
    }

    // Insert generated dummy attendance records into the database
    await attendanceModel.insertMany(dummyRecords);
    res.send('✅ 365 days of dummy attendance added!');

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to seed attendance');
  }
});


router.get('/:id', checkAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).render('error', { message: 'Invalid ID format' });
    }

    const employee = await userModel.findById(req.params.id);
    if (!employee) return res.status(404).render('error', { message: 'Employee not found' });

    res.render("index", { employee });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error' });
  }
});

router.get('/delete/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send('Invalid ID format');
    }

    await userModel.findOneAndDelete({ _id: req.params.id });
    res.redirect('/admin');
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.send('Something went wrong!');
  }
});

router.get('/:id/logout', (req, res) => {
  try {
    res.clearCookie('userId');
    res.redirect('/');
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).send('Something went wrong.');
  }
});

export default router;
