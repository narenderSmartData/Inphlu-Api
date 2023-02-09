
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

// app.get("/test", (req, res) => {
//   res.send("<h1>It's working from server 2 🤗</h1>")
// })

//#region OpenAI ChatGpt API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: "org-rljhcAIEA3MrbJrIQymc0gjq"
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

// 1. This Method will return top 10 topics based on the provided INDUSTRY
app.post('/api/generateTopicsBasedOnIndustry', async (req, res)=>{
  try {
      const industry = req.body.industry;
      console.log('industry', industry);
      const query = `Give top 10 topics related to ${industry} in json format`; 
      console.log('query', query);

      const dataFromOpenAi = await GenerateContentFromOpenAI(query);

      res.status(200).send(dataFromOpenAi);
  } catch (error) {
      console.log(error);
      res.status(500).send({error});
  }
})

// 2. This Method will return headline and article based on topic and rewrite option
app.post('/api/generateHeadLineAndArticleBasedOnTopic', async (req, res)=>{
  try {
      const topic = req.body.topic;
      const isReWrite = req.body.rewrite;
      console.log('topic', topic);
      console.log('isReWrite', isReWrite);
     
      let query = `Provide headline and short article for ${topic} in json format`;
      if(isReWrite == 'true') query = "Regenerate "+query
      console.log('query', query);

      const dataFromOpenAi = await GenerateContentFromOpenAI(query);

      res.status(200).send(dataFromOpenAi);
  } catch (error) {
      console.log(error);
      res.status(500).send({error});
  }
})

// 3. This Method will return top 5 keywords for Shutterstock image search based on topic
app.post('/api/generateKeyWordsForShutterStockBasesOnTopic', async (req, res)=>{
  try {
      const topic = req.body.topic;
      const query = `Provide top 5 Keywords for Shutterstock image search based on ${topic} in json format`;

      const dataFromOpenAi = await GenerateContentFromOpenAI(query);
      res.status(200).send(dataFromOpenAi);
  } catch (error) {
      console.log(error);
      res.status(500).send({error});
  }
})

// 4. This Method will return headline and article based on user free text
app.post('/api/generateContentBasedOnFreeText', async (req, res)=>{
  try {
      const userInput = req.body.userInput;;
      console.log('userInput', userInput);
      const query = `Provide headline and short article for ${userInput} in json format`;
      console.log('query', query);

      const dataFromOpenAi = await GenerateContentFromOpenAI(query);

      res.status(200).send(dataFromOpenAi);
  } catch (error) {
      console.log(error);
      res.status(500).send({error});
  }
})

// This Method will be used as helper for all the other methods to generate data based on query to Open AI api
// we need to update the object with some better field values
const  GenerateContentFromOpenAI = async (query) =>{
  try {   
      const response = await openai.createCompletion({
          // model: "text-davinci-003",
          model: "text-davinci-003",
          prompt: `${query}`,
          temperature: 0,
          max_tokens: 3000,
          top_p: 1,
          frequency_penalty: 0.5,
          presence_penalty: 0,
      })
      if(response.data){
          return response.data.choices[0].text
      }
      else
      { 
          return "No Data returned from OpenAI"
      }
          
  } catch (error) {
      return `Error in OpenAI ${error}`     
  }
}

//#endregion

const port = 8080
app.listen(port, () => console.log(`Listening on port ${port}`))