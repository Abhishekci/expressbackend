const router = require('express').Router();
const Task = require('../models/task');
const User = require('../models/user');
const authenticationToken = require('./auth');

//create Task 
router.post('/create-task', authenticationToken, async (req, res) => {

    try {
        const { title, desc, important, complete } = req.body;
        const {id} = req.headers;
        const newTask = new Task({ title:title, desc:desc, important: important, complete: complete });
        const savedTask = await newTask.save();
        const taskId = savedTask._id;
        await User.findByIdAndUpdate(id, { $push: { tasks: taskId._id } });
        res.status(200).json({ message: 'Task created successfully' });

    } catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
});

// Fetch Tasks
router.get('/get-tasks', authenticationToken, async (req, res) => {
    try {
        const {id} = req.headers;
        const userData = await User.findById(id).populate({path: "tasks", options: { sort: {createdAt: -1}}});
        res.status(200).json({data: userData});

    } catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
})

// Delete Tasks API 

router.delete('/delete-tasks/:id', authenticationToken, async (req, res) => {
    try {
        const {id} = req.params;
        const userId = req.headers.id;
        await Task.findByIdAndDelete(id);
        await User.findByIdAndUpdate(userId, {$pull:{tasks: id}})
        res.status(200).json({message: "Task deleted successfully"});
    } catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
});

//Update Tasks API
router.put('/update-tasks/:id', authenticationToken, async (req, res) => {
    try {
        const { id } = req.params;
        const {title, desc} = req.body;
        await Task.findByIdAndUpdate(id, {title: title, desc: desc});
        res.status(200).json({message: "Task updated successfully"});
    }
    catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
});

//Update Important Tasks API
router.put('/update-imp-tasks/:id', authenticationToken, async (req, res) => {
    try {
        const { id } = req.params;
        const taskData = await Task.findById(id);
        const impTask = taskData.important;
        await Task.findByIdAndUpdate(id, {important: !impTask});
        res.status(200).json({message: "Important Task updated successfully"});
    }
    catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
})

//Update Complete Tasks API
router.put('/update-comp-tasks/:id', authenticationToken, async (req, res) => {
    try {
        const { id } = req.params;
        const taskData = await Task.findById(id);
        const compTask = taskData.complete;
        await Task.findByIdAndUpdate(id, {complete: !compTask});
        res.status(200).json({message: "Completed Task updated successfully"});
    }
    catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
})

// Get Important Tasks API
router.get('/get-imp-tasks', authenticationToken, async (req, res) => {
    try {
        const {id} = req.headers;
        const Data = await User.findById(id).populate({path: "tasks", match: {important :true}, options: {sort: {createdAt: -1}} });
        const impTaskData = Data.tasks
        res.status(200).json({data: impTaskData});

    } catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
})

// Get Complete Tasks API
router.get('/get-com-tasks', authenticationToken, async (req, res) => {
    try {
        const {id} = req.headers;
        const Data = await User.findById(id).populate({path: "tasks", match: {complete :true}, options: {sort: {createdAt: -1}} });
        const comTaskData = Data.tasks
        res.status(200).json({data: comTaskData});

    } catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
})

// Get Incomplete Tasks API
router.get('/get-incomp-tasks', authenticationToken, async (req, res) => {
    try {
        const {id} = req.headers;
        const Data = await User.findById(id).populate({path: "tasks", match: {complete :false}, options: {sort: {createdAt: -1}} });
        const comTaskData = Data.tasks
        res.status(200).json({data: comTaskData});

    } catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
})

// Get non important Tasks API
router.get('/get-notimp-tasks', authenticationToken, async (req, res) => {
    try {
        const {id} = req.headers;
        const Data = await User.findById(id).populate({path: "tasks", match: {important :false}, options: {sort: {createdAt: -1}} });
        const comTaskData = Data.tasks
        res.status(200).json({data: comTaskData});

    } catch (err) {
        console.log(err);
        res.status(400).json({message: "Internal Server Error"})
    }
})

module.exports = router;