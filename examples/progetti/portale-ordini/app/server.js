const express = require("express");
const pino = require("pino");
const auth = require("./auth");
const orders = require("./orders");
const upload = require("./upload");

const log = pino({ redact: ["req.headers.authorization", "body.password"] });
const app = express();
app.use(express.json({ limit: "200kb" }));

app.use((req, res, next) => {
  req.log = log.child({ ip: req.socket.remoteAddress, path: req.path });
  next();
});

app.get("/healthz", (req, res) => res.send("ok"));

app.post("/login", auth.login);
app.post("/password/forgot", auth.forgotPassword);
app.post("/password/reset", auth.resetPassword);

app.get("/api/orders", auth.requireUser, orders.list);
app.get("/api/orders/:id", auth.requireUser, orders.get);
app.post("/api/orders", auth.requireUser, orders.create);
app.post("/api/orders/import", auth.requireUser, orders.importXml);

app.post("/api/files", auth.requireUser, upload.save);
app.get("/api/files/:name", auth.requireUser, upload.download);

app.post("/api/webhooks/test", auth.requireUser, orders.testWebhook);

app.get("/api/admin/users", auth.requireUser, auth.requireAdmin, auth.listUsers);
app.post("/api/admin/users/:id/role", auth.requireUser, auth.requireAdmin, auth.setRole);
app.get("/api/admin/export/customers", auth.requireUser, auth.requireAdmin, orders.exportCustomers);

app.listen(3000, () => log.info("listening on 3000"));
