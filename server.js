const multer = require('multer')
const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const File = require('./models/file')

require('./config/mongo')
require('dotenv').config()

const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true }))

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
    res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` })

})

app.get("/file/:id", handleDownload)
app.post("/file/:id", handleDownload)

async function handleDownload(req, res) {
    const file = await File.findById(req.params.id)

    console.log(file.password)
    if (file.password != null) {
        if (req.body.password == null) {
            console.log(req.body.password)

            res.render("password")
            return
        }

        if (!(await bcrypt.compare(req.body.password, file.password))) {
            res.render("password", { error: true })
            return
        }
    }

    file.downloadCount++
    await file.save()
    console.log(file.downloadCount)

    res.download(file.path, file.originalName)

}


app.listen(process.env.PORT, () => {
    console.log(`Listening on port 3000...`)
});