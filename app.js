//const http = require('http')
import express from "express";
import morgan from "morgan";
import cors from "cors";
import notes_Router from "./controllers/notes";
// The Prisma Client API is generated based on the models in your Prisma schema

/**
 * Basic routing
 * Routing refers to determining how an application responds to a client request to a particular endpoint,
 * which is a URI (or path) and a specific HTTP request method (GET, POST, and so on).
 * Each route can have one or more handler functions, which are executed when the route is matched.
 */
//So basically it seems like I am defining the route logic for each request
const app = express();
/**It is not necessary to call $connect() thanks to the lazy connect behavior: The PrismaClient instance connects
 * lazily when the first request is made to the API ($connect() is called for you under the hood). */

//For more info on cors middleware check GH repo. This is default for accepting all CORS requests
app.use(cors());
app.use(express.static("dist"));
/**Middleware are functions that can be used for handling request and response objects. */
// const requestLogger = (request, response, next) => {
//   console.log("Method:", request.method);
//   console.log("Path:  ", request.path);
//   console.log("Body:  ", request.body);
//   console.log("---");
//   next();
// };
/**json-parser is also a middleware */
app.use(express.json());

/**Middleware functions are called in the order that they're taken into use with the express server
 * object's use method. Notice that json-parser is taken into use before the requestLogger middleware,
 * because otherwise request.body will not be initialized when the logger is executed! */
// app.use(requestLogger);
morgan.token("resbody", (request) =>
  request.method == "POST" ? JSON.stringify(request.body) : ""
);
const logger = morgan(
  ":method :url :status :res[content-length] - :response-time ms :resbody"
);
app.use(logger);

app.use("/api/notes", notes_Router);
/**There are also situations where we want to define middleware functions after routes.
 * In practice, this means that we are defining middleware functions that are only
 * called if no route handles the HTTP request. */
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

export default app;
