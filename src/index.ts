import * as express from "express";
import * as enforce from "express-sslify";
import * as cookieParser from "cookie-parser";
import * as routes from "./routes";
import DatabaseManager from "./services";
import initDB from "./dbinit";
import * as path from "path";

/**
 * Debug/production environment.
 */
const debug = !!parseInt(process.env.DEBUG);

/**
 * Port number to use.
 */
const port = parseInt(process.env.PORT) || 3000;

/**
 * Database URL.
 */
const dbURL = process.env.DATABASE_URL;

/**
 * Express app.
 */
const app = express();

// Disable caching for authentication purposes
app.set("etag", false);
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

// Enforce HTTPS
if (!debug) {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Cookie parser
app.use(cookieParser());

// Include static directory for css and js files
app.use(express.static(path.join(__dirname + "/../../app/dist/md-docs")));

// Set maximum JSON body size
app.use(express.json({ limit: "8mb" }));

// Use routes
app.use("/image", routes.imageRouter);
app.use("/api", express.json(), routes.userRouter);
app.use("/api", express.json(), routes.loginRegisterRouter);
app.use("/api", express.json(), routes.verificationRouter);
app.use("/api", express.json(), routes.passwordResetRouter);
app.use("/api", express.json(), routes.groupRouter);
app.use("/api", express.json(), routes.documentRouter);
app.use("/api", express.json(), routes.directoryRouter);

app.use((req, res) => {
  res.sendFile(path.join(__dirname + "/../../app/dist/md-docs/index.html"));
});

// Error 500 (internal server error)
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// Create the database manager
const dbm = new DatabaseManager(dbURL, 20, "sql");

// Initialize the database
initDB(dbm).then(() => {
  // Put the database manager in the app object
  app.set("dbm", dbm);

  // Listen for connections
  app.listen(port, () => {
    console.log(`App running on port ${port}`);
  });
});

// Export the express app
export = app;
