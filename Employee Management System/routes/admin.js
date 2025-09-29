import express from "express";
import dotenv from "dotenv";
import userRouter from "../routes/user.js";  
import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js"; 
import taskModel from "../models/tasksModel.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

dotenv.config();

router.use('/user', userRouter); 

router.get('/', async (req, res) => {
    try {
        const employee = await userModel.find();
        res.render('admin', { employee });
    } catch (err) {
        console.error("Error fetching employees:", err);
        res.status(500).send("Server Error");
    }
});

router.get("/attendance", async (req, res) => {
  try {
    const quarter = parseInt(req.query.q) || 1;
    const daysToShow = 30;
    const skipDays = (quarter - 1) * daysToShow;

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() - skipDays);

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (daysToShow - 1));

    const options = { month: 'long', year: 'numeric' };
    const startMonth = startDate.toLocaleDateString('en-US', options);
    const endMonth = endDate.toLocaleDateString('en-US', options);

    const employees = await userModel.find().lean();
    const attendanceMap = {};

    for (const emp of employees) {
      const allDays = [];
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        allDays.push({ date: new Date(currentDate), status: null });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const records = await attendanceModel.find({
        user: emp._id,
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

      attendanceMap[emp._id] = {
        grid: allDays,
        presentCount,
        absentCount,
        lateCount,
        startMonth,
        endMonth
      };
    }

    res.render("adminAttendance", {
      employees,
      attendanceMap
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating admin attendance view.");
  }
});

router.get('/tasks', async (req, res) => {
  try {

    const tasks = await taskModel.find();
    const employee = await userModel.find(); 
    res.render('adminTask', { employee, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/tasks/add', async (req, res) => {
  try {
    const employeeList = await userModel.find();
    const taskList = await taskModel.find();
    res.render('addTask', { employeeList, taskList});
  } catch (error) {
    console.error('Error fetching employee list:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/tasks/assign', async (req, res) => {
  const { employeeId, title, description } = req.body;

  try {
    
    const employee = await userModel.findById(employeeId);
    if (!employee) {
      return res.status(404).send('Employee not found');
    }

    
    const newTask = new taskModel({
      title,
      description,
      assignedTo: employeeId,
      status: 'Pending', 
    });

    await newTask.save();
    res.redirect('/admin/tasks'); 

  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/reports', async (req, res) => {
  try {
    const employees = await userModel.find().populate('tasks'); // 'tasks' must match the updated schema
    const tasks = await taskModel.find().populate('assignedTo'); // <-- Important!
    res.render('adminReports', { employees, tasks });
  } catch (error) {
    console.error("Error fetching employees or tasks:", error);
    res.status(500).send("Internal server error");
  }
});


router.get('/settings', async (req, res) => {
  try {
    const employees = await userModel.find(); // Fetch all employees
    res.render("adminSettings", { employees }); // Pass employees to the view
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/user/:id/edit', async (req, res) => {
  try {
    const employee = await userModel.findById(req.params.id); 
    if (!employee) {
      return res.status(404).send("User not found");
    }
    res.render('adminEditUser', { employee }); 
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/user/:id/update', async (req, res) => {
  const { name, email, number, password } = req.body;

  const updates = { name, email, number };

  if (password && password.trim() !== '') {
    updates.password = password; // If password is provided, include it in the updates
  }

  try {
    await userModel.findByIdAndUpdate(req.params.id, updates); // Update the user in the database
    res.redirect('/admin'); // Redirect to the admin dashboard or wherever appropriate
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update user");
  }
});



router.get('/logout', checkAuth, (req, res) => {
  
    res.redirect('/');
  });
export default router;