const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const tasksFile = path.join(__dirname, "tasks.json");

app.use(express.json());


const validateTask = (req, res, next) => {
    const { title, status } = req.body;
    if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Title is required and must be a string." });
    }
    if (status && !["pending", "completed"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'pending' or 'completed'." });
    }
    next();
};

const readTasks = () => {
    if (!fs.existsSync(tasksFile)) return [];
    const data = fs.readFileSync(tasksFile);
    return JSON.parse(data);
};

const writeTasks = (tasks) => {
    fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));
};

app.get("/tasks", (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

app.post("/tasks", validateTask, (req, res) => {
    const tasks = readTasks();
    const newTask = { id: Date.now(), ...req.body };
    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
});

app.put("/tasks/:id", validateTask, (req, res) => {
    let tasks = readTasks();
    const taskIndex = tasks.findIndex(t => t.id == req.params.id);
    if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });
    tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
    writeTasks(tasks);
    res.json(tasks[taskIndex]);
});

app.delete("/tasks/:id", (req, res) => {
    let tasks = readTasks();
    const filteredTasks = tasks.filter(t => t.id != req.params.id);
    if (tasks.length === filteredTasks.length) return res.status(404).json({ error: "Task not found" });
    writeTasks(filteredTasks);
    res.json({ message: "Task deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
