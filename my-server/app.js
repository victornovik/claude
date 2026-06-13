const express = require("express"); // import the Express library
const app = express(); // create an instance of the Express application
const port = 3000;

app.use(express.static("public"));

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
