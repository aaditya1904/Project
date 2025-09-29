import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Completed', 'In Progress', 'Pending'],
    default: 'Pending',
  },
  description: {
    type: String,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // The task may be assigned to a User (Employee)
  },
});

const taskModel = mongoose.model('Task', taskSchema);

export default taskModel;
