
import express from 'express';
import morgan from 'morgan';

import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import sstk from 'shutterstock-api'
dotenv.config();


const app = express()

app.use(morgan(":method :url :status :res[content-length] - :response-time ms"))
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("<h1>It's working from server 2 🤗</h1>")
})

//#region OpenAI ChatGpt API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration);

// app.use(cors());

app.get('/test', async (req, res) =>{
  res.status(200).send({
      message: `Use specific api routes to get the data  
      1.api/generateTopicsBasedOnIndustry 
      2.generateHeadLineAndArticleBasedOnTopic 
      3.generateKeyWordsForShutterStockBasesOnTopic 
      4.generateContentBasedOnFreeText 
      5.generateTopicsBasedOnIndustry `,
  })
})



const port = 8080
app.listen(port, () => console.log(`Listening on port ${port}`))