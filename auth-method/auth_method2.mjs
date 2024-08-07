//Method 2
//Store password hash in the database
import Express from "express";
import crypto from "crypto";

const port = process.env.PORT || 3000;
const app = new Express();
app.use(Express.json());
import pg from "pg";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "123456",
  database: "postgres",
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

//login post request
app.post("/login", async (req, res) => {
  const sql =
    "select username from auth_method2 where username = $1 and password = $2";
  const result = await pool.query(sql, [
    req.body.user,
    sha256(req.body.password),
  ]);

  //fail
  if (result.rowCount === 0)
    res.send({ error: "Incorrect username or password" });
  else res.send({ success: "Logged in successfully!" });
});

//register post request
app.post("/register", async (req, res) => {
  //check if user exist
  const sql = "select username from auth_method2 where username = $1";
  const result = await pool.query(sql, [req.body.user]);

  //success, user is not there create it
  if (result.rowCount === 0) {
    await pool.query(
      "insert into auth_method2 (username, password) values ($1,$2)",
      [req.body.user, sha256(req.body.password)]
    );
    res.send({ success: "User created successfully" });
  } else res.send({ error: "User already exists.." });
});

app.listen(port, () => console.log("Auth Method 2 - Listening on " + port));

function sha256(txt) {
  const secret = "abcdefg";
  const hash = crypto.createHmac("sha256", secret).update(txt).digest("hex");
  return hash;
}
