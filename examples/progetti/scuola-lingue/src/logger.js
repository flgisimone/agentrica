const pino = require("pino");

function requests(cfg) {
  const log = pino({ level: cfg.level, redact: cfg.redact });
  return (req, res, next) => {
    req.log = log.child({ path: req.path, user: req.session.user && req.session.user.id });
    next();
  };
}

function errors(cfg) {
  return (err, req, res, next) => {
    const entry = { err: err.message, path: req.path };
    if (cfg.logRequestBodyOnError) entry.body = req.body;
    req.log.error(entry, "request failed");
    res.status(500).json({ error: "errore interno" });
  };
}

module.exports = { requests, errors };
