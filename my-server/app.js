require("dotenv").config();
const express = require("express"); // import the Express library

const app = express(); // create an instance of the Express application
const port = 3000;

app.use(express.static("public"));

// Secrets come from .env, not hardcoded
const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.DB_PASSWORD;
const PORT = process.env.PORT || 3000;

console.log("API key loaded:", API_KEY ? "Yes" : "No");
console.log("Database password loaded:", DB_PASSWORD ? "Yes" : "No");


app.get("/", (req, res) => {
  res.send("Hi Victor!");
});

app.get("/about", (req, res) => {
  res.send("About endpoint");
});

app.get("/greeting", (req, res) => {
  const name = req.query.name || "World";
  res.send("Hi, " + name);
});

app.get("/contact", (req, res) => {
  res.send("Contact me at: hello@mysite.com");
});

app.get("/api/time", (req, res) => {
  res.json({
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
  });
});

app.get("/api/joke", async (req, res) => {
  try {
    const response = await fetch(
      "https://official-joke-api.appspot.com/random_joke",
    );
    const joke = await response.json();
    res.json({ setup: joke.setup, punchline: joke.punchline });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch joke" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
