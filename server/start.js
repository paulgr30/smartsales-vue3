// when using Vue Router "history" mode
const express = require("express"),
  serveStatic = require("serve-static"),
  history = require("connect-history-api-fallback"),
  port = process.env.PORT || 3000;

const app = express();

app.use(history());
app.use(serveStatic("../dist/spa", { index: ["index.html", "index.htm"] }));
app.listen(port);
console.log("Server running");
// when using default Vue Router "hash" mode

// const express = require("express"),
//   serveStatic = require("serve-static"),
//   port = process.env.PORT || 3000;

// const app = express();

// app.use(serveStatic("dist/spa", { index: ["index.html", "index.htm"] }));
// app.listen(port);
