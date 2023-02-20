// const express = require("express");
import express from "express";
import jwt from "jsonwebtoken";

import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
const openaiRouter = express.Router();

dotenv.config();

//#region OpenAI ChatGpt API
const configuration = new Configuration({
	organization: process.env.OPENAI_API_ORGID,
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// 1. This Method will return top 10 topics based on the provided INDUSTRY
openaiRouter.post(
	"/generateTopicsBasedOnIndustry",
	authenticateToken,
	async (req, res) => {
		try {
			const industry = req.body.industry;
			if (industry == undefined)
				res
					.status(400)
					.send('Input body request must contain "industry" field');

			console.log("industry", industry);
			const query = `Give top 10 topics related to ${industry} in json format`;

			const dataFromOpenAi = await GenerateContentFromOpenAI(query);

			res.status(200).send(dataFromOpenAi);
		} catch (error) {
			console.log(error);
			res.status(500).send({ error });
		}
	}
);

// 2. This Method will return headline and article based on topic and rewrite option
openaiRouter.post(
	"/generateHeadLineAndArticleBasedOnTopic",
	authenticateToken,
	async (req, res) => {
		try {
			const topic = req.body.topic;
			const isReWrite = req.body.rewrite;
			console.log("topic", topic);
			console.log("isReWrite", isReWrite);

			if (topic == undefined)
				res.status(400).send('Input body request must contain "topic" field');

			let query = `Provide headline and short article for ${topic} in json format`;
			if (isReWrite == "true") query = "Regenerate " + query;

			const dataFromOpenAi = await GenerateContentFromOpenAI(query);

			res.status(200).send(dataFromOpenAi);
		} catch (error) {
			console.log(error);
			res.status(500).send({ error });
		}
	}
);

// 3. This Method will return top 5 keywords for Shutterstock image search based on topic
openaiRouter.post(
	"/generateKeyWordsForShutterStockBasesOnTopic",
	authenticateToken,
	async (req, res) => {
		try {
			const topic = req.body.topic;
			const query = `Provide top 5 Keywords for Shutterstock image search based on ${topic} in json format`;

			if (topic == undefined)
				res.status(400).send('Input body request must contain "topic" field');

			const dataFromOpenAi = await GenerateContentFromOpenAI(query);
			res.status(200).send(dataFromOpenAi);
		} catch (error) {
			console.log(error);
			res.status(500).send({ error });
		}
	}
);

// 4. This Method will return headline and article based on user free text
openaiRouter.post(
	"/generateContentBasedOnFreeText",
	authenticateToken,
	async (req, res) => {
		try {
			const userInput = req.body.userInput;
			console.log("userInput", userInput);
			const query = `Provide headline and short article for ${userInput} in json format`;

			const dataFromOpenAi = await GenerateContentFromOpenAI(query);

			res.status(200).send(dataFromOpenAi);
		} catch (error) {
			console.log(error);
			res.status(500).send({ error });
		}
	}
);

// This Method will be used as helper for all the other methods to generate data based on query to Open AI api
// we need to update the object with some better field values
const GenerateContentFromOpenAI = async (query) => {
	try {
		const response = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: `${query}`,
			temperature: 0,
			max_tokens: 3000,
			top_p: 1,
			frequency_penalty: 0.5,
			presence_penalty: 0,
		});
		if (response.data) {
			return response.data.choices[0].text;
		} else {
			return "No Data returned from OpenAI";
		}
	} catch (error) {
		return `Error in OpenAI ${error}`;
	}
};

function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.status(403).send("Invalid access token");
		req.user = user;
		next();
	});
}
//#endregion

// module.exports = openaiRouter;
export default openaiRouter;
