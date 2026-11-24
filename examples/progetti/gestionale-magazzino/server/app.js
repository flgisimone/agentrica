const express = require("express");
const path = require("path");
const { requireUser } = require("./auth");

const app = express();
app.use("/webhooks", express.raw({ type: "application/json", limit: "100kb" }), require("./routes/webhooks"));
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "../web"), { maxAge: "1h" }));

app.use("/api", requireUser);
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/reports", require("./routes/reports"));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "errore interno" });
});

app.listen(process.env.PORT || 3000);
