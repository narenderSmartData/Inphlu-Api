import createError from "http-errors";
import express from "express";
import bodyParser from "body-parser";

import authRouter from "./authRouter.js";
import openaiRouter from "./openaiRouter.js";
import sstkRouter from "./shutterstockRouter.js";

const app = express();

app.use(express.json());

app.use(bodyParser.json());

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.use("/api", authRouter);
app.use("/api", openaiRouter);
app.use("/api", sstkRouter);

// Handling Errors
app.use((err, req, res, next) => {
	// console.log(err);
	err.statusCode = err.statusCode || 500;
	err.message = err.message || "Internal Server Error";
	res.status(err.statusCode).json({
		message: err.message,
	});
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server is running on port ${port}`));
