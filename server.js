const multer = require('multer')
const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const File = require('./models/file')

require('./config/mongo')
require('dotenv').config()

const express = require('express')
const app = express()

const upload = multer({ dest: "uploads/" })


app.set("view engine", "ejs")

app.get("/", (req, res) => {
    res.render("index")
});

app.post("/upload", upload.single("file"), async (req, res) => {
    const fileData = {
        path: req.file.path,
        originalName: req.file.originalname,
    }
    if (req.body.password != null && req.body.password !== "") {
        fileData.password = await bcrypt.hash(req.body.password, 10)
    }

    const file = await File.create(fileData)
    // console.log(file)
    // res.send(file.originalName)

    res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` })

})

app.get("/file/:id", (req, res) => {

})



app.listen(process.env.PORT, () => {
    console.log(`Listening on port 3000...`)
});