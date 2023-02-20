import express from "express";
const authRouter = express.Router();
import db from "./dbConnection.js";
import jwt from "jsonwebtoken";
import hasher from "wordpress-hash-node";

//#region Login

let refreshTokens = [];

authRouter.post("/login", async (req, res) => {
	const userName = req.body.username;
	const password = req.body.password;
	if (userName == undefined || password == undefined)
		res.status(400).send("Username or password is missing in the requeset");
	let isValidUser;
	db.query(
		`SELECT * FROM ${process.env.DATABASE}.wp_users where user_login = '${userName}'`,
		await function (error, results, fields) {
			if (error) {
				console.log("error in sql reading", error);
				return res.status(404).send("Invalid userName");
			} else {
				if (results.length == 0)
					return res
						.status(404)
						.send(
							"Invalid Username, Please provide correct userName and password"
						);
				let hashedPassword = results[0].user_pass;
				var checked = hasher.CheckPassword(password, hashedPassword);
				if (checked) isValidUser = true;
				else isValidUser = "Invalid Password, Please provide correct password";

				if (isValidUser == true) {
					const user = { name: userName };
					const accessToken = generateAccessToken(user);
					const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
					refreshTokens.push(refreshToken);
					res
						.status(200)
						.send({ accessToken: accessToken, refreshToken: refreshToken });
				} else {
					console.log(isValidUser);
					res.status(404).send({ message: isValidUser });
				}
			}
		}
	);
});

authRouter.post("/token", (req, res) => {
	const refreshToken = req.body.refreshToken;
	if (refreshToken == null) return res.sendStatus(401);
	console.log(refreshTokens);
	if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		const accessToken = generateAccessToken({ name: user.name });
		res.status(200).send({ accessToken: accessToken });
	});
});

authRouter.post("/logout", (req, res) => {
	refreshTokens = refreshTokens.filter((token) => token != req.body.token);
	res.status(204).send("Logged out !!");
});

async function vaildateUserCredentials(username, password) {
	db.query(
		`SELECT * FROM inphlu_uat_001.wp_users where user_login = '${username}'`,
		await function (error, results, fields) {
			console.log("result.count", results.length);
			if (error) {
				console.log("error in sql reading", error);
				return "Invalid username";
			}
			if (results.length == 0)
				return "Invalid Username, Please provide correct username and password";
			let hashedPassword = results[0].user_pass;
			var checked = hasher.CheckPassword(password, hashedPassword);
			console.log("checked", checked);
			if (checked) return true;
			else return "Invalid Password, Please provide correct password";
		}
	);
}

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

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

// module.exports = authRouter;
export default authRouter;
