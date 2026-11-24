const express = require("express");
const session = require("express-session");
const config = require("../config/default.json");
const auth = require("./auth");
const account = require("./account");
const exporter = require("./export");
const documents = require("./documents");
const newsletter = require("./newsletter");
const logger = require("./logger");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: true, sameSite: "lax", maxAge: 8 * 3600 * 1000 },
  }),
);
app.use(logger.requests(config.logging));

const can = (...roles) => (req, res, next) => (req.session.user && roles.includes(req.session.user.role) ? next() : res.sendStatus(403));

app.post("/login", auth.login);
app.post("/signup", auth.signup);

app.get("/me/export", can("student", "parent", "teacher"), account.exportMine);
app.post("/me/delete", can("student", "parent", "teacher"), account.deleteMine);
app.get("/newsletter/unsubscribe", newsletter.unsubscribe);

app.get("/classes/:id/students.csv", can("teacher", "support", "admin"), exporter.studentsCsv);
app.get("/payers/:id/document", can("support", "admin"), documents.download);

app.use(logger.errors(config.logging));
app.listen(3000);
