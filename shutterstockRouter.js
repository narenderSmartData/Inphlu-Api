import express from "express";
import jwt from "jsonwebtoken";
const sstkrouter = express.Router();
import * as dotenv from "dotenv";
import sstk from "shutterstock-api";

dotenv.config();

//#region Shuttuerstocks API
sstk.setAccessToken(process.env.SHUTTERSTOCK_API_TOKEN);
const imagesApi = new sstk.ImagesApi();

// 1. This Method will return images from Shutterstocks
sstkrouter.post(
	"/getImagesFromShutterstocks",
	authenticateToken,
	async (req, res) => {
		let images = [];
		try {
			const keywords = req.body.keywords;
			console.log("keywords", keywords);
			const queryParams = {
				query: keywords,
				image_type: "photo",
				page: 1,
				per_page: 5,
				view: "minimal",
				sort: "relevance",
				orientation: "horizontal",
			};

			imagesApi
				.searchImages(queryParams)
				.then((data) => {
					data.data.forEach((image) => {
						images.push(image.assets.preview_1500.url);
					});
					res.status(200).send(images);
				})
				.catch((error) => {
					console.error(error);
					res.status(500).send({ error });
				});
		} catch (error) {
			console.log(error);
			res.status(500).send({ error });
		}
	}
);

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

export default sstkrouter;
