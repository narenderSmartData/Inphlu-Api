import mysql from "mysql";

var conn = mysql.createConnection({
	host: process.env.HOST,
	user: "root",
	password: "Th644TOJa1=yuviPlyeD",
	database: process.env.DATABASE,
});

conn.connect(function (err) {
	if (err) {
		console.log("Error in DB connection-->", err);
		throw err;
	}
	console.log("Database is connected successfully !");
});
export default conn;
