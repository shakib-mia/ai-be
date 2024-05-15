const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const app = express();
const port = 5000;
const jwt = require("jsonwebtoken");
require("dotenv").config();
app.use(cors());
app.use(express());
app.use(express.json());
const bcrypt = require("bcrypt");
const saltRounds = 10;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://raddito22:${process.env.DB_PASSWORD}@cluster0.zcfcb1f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Express Routes

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

async function run() {
  try {
    await client.connect();
    const usersCollection = client.db("ai").collection("users");

    app.post("/register", async (req, res) => {
      const { email, password } = req.body;
      const user = await usersCollection.findOne({ email });

      if (!user) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
          bcrypt.hash(password, salt, async function (err, hash) {
            // console.log(hash);
            if (!err) {
              const newBody = {
                email,
                password: hash,
              };

              const insertCursor = await usersCollection.insertOne(newBody);
              // res.send(insertCursor);
              const token = jwt.sign(
                { email },
                process.env.access_token_secret,
                {
                  expiresIn: "1h",
                }
              );

              res.send(token);
            }
          });
        });

        // res.status(200).send("User can be created");
      } else {
        res.status(400).send("User already exists");
      }
    });

    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      const user = await usersCollection.findOne({ email });
      if (user) {
        // console.log(user);
        bcrypt.compare(password, user.password, (error, result) => {
          // console.log(error);
          // console.log(result);
          if (result) {
            const token = jwt.sign({ email }, process.env.access_token_secret, {
              expiresIn: "1h",
            });

            res.send({ token });
          } else {
            res.status(401).send("Incorrect Password");
          }
        });
      } else {
        res.status(404).send("No Users Found");
      }
    });
  } catch (err) {
    console.error(err);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
