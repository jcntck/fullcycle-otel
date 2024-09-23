const { NodeTracerProvider } = require("@opentelemetry/node");
const {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} = require("@opentelemetry/tracing");
const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const provider = new NodeTracerProvider();
const consoleExporter = new ConsoleSpanExporter();

const spanProcessor = new SimpleSpanProcessor(consoleExporter);
provider.addSpanProcessor(spanProcessor);

const zipkinExporter = new ZipkinExporter({
  url: "http://localhost:9411/api/v2/spans",
  serviceName: "course-service",
});
const zipkinProcessor = new SimpleSpanProcessor(zipkinExporter);
provider.addSpanProcessor(zipkinProcessor);

provider.register();

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  res.type("json");
  await new Promise((resolve) => setTimeout(resolve, 50));

  const db = new sqlite3.Database(
    "db.sqlite3",
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Connected to the SQLite database.");
    }
  );

  db.all("SELECT * FROM courses", [], (err, rows) => {
    if (err) {
      console.error(err.message);
    }
    res.status(200).json({ rows });
    db.close((err) => {
      if (err) {
        console.error(err.message);
      }
      console.log("Close the database connection.");
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
