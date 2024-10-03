const express = require('express');
const app = express();
require("dotenv").config();
require("./connection/conn");
const cors = require("cors");
const UserAPI = require('./routes/user')
const TaskAPI = require('./routes/task')
app.use(cors());
app.use(express.json())

app.use("/api/v1", UserAPI);
app.use("/api/v2", TaskAPI);

app.use("/",(req, res) => {
    res.send("hello")
})

//localhost:1000/api/v1/sign-in
//localhost:1000/api/v2/create-task

const port = 1000;

app.listen(port, () =>{
    console.log("server started")
})