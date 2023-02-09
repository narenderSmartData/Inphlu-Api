
import express from 'express';
import morgan from 'morgan';

const app = express()

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))

app.get("/test", (req, res) => {
  res.send("<h1>It's working from server 2 🤗</h1>")
})



const port = 8080
app.listen(port, () => console.log(`Listening on port ${port}`))