//const http = require('http')
import express from "express";
import morgan from "morgan";
import cors from "cors";

// The Prisma Client API is generated based on the models in your Prisma schema
import { PrismaClient } from "@prisma/client";

// let notes = [
//   {
//     id: 1,
//     content: "HTML is easy",
//     date: "2022-05-30T17:30:31.098Z",
//     important: true,
//   },
//   {
//     id: 2,
//     content: "Browser can execute only Javascript",
//     date: "2022-05-30T18:39:34.091Z",
//     important: false,
//   },
//   {
//     id: 3,
//     content: "GET and POST are the most important methods of HTTP protocol",
//     date: "2022-05-30T19:20:14.298Z",
//     important: true,
//   },
// ];

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { "Content-type": "application/json" });
//   response.end(JSON.stringify(notes));
// });

/**
 * Basic routing
 * Routing refers to determining how an application responds to a client request to a particular endpoint,
 * which is a URI (or path) and a specific HTTP request method (GET, POST, and so on).
 * Each route can have one or more handler functions, which are executed when the route is matched.
 */
//So basically it seems like I am defining the route logic for each request
const app = express();

const prisma = new PrismaClient({
  errorFormat: "pretty",
});

/**It is not necessary to call $connect() thanks to the lazy connect behavior: The PrismaClient instance connects
 * lazily when the first request is made to the API ($connect() is called for you under the hood). */

//For more info on cors middleware check GH repo. This is default for accepting all CORS requests
app.use(cors());
app.use(express.static("dist"));
/**Middleware are functions that can be used for handling request and response objects. */
const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};
/**json-parser is also a middleware */
app.use(express.json());

/**Middleware functions are called in the order that they're taken into use with the express server
 * object's use method. Notice that json-parser is taken into use before the requestLogger middleware,
 * because otherwise request.body will not be initialized when the logger is executed! */
// app.use(requestLogger);
morgan.token("resbody", (request, response) =>
  request.method == "POST" ? JSON.stringify(request.body) : ""
);
const logger = morgan(
  ":method :url :status :res[content-length] - :response-time ms :resbody"
);
app.use(logger);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", async (request, response) => {
  const notes = await prisma.note.findMany();
  response.send(notes);
});

app.get("/api/notes/:id", async (request, response) => {
  const id = String(request.params.id);
  const note = await prisma.note.findUnique({
    where: {
      id: id,
    },
  });

  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/notes/:id", async (request, response) => {
  const id = String(request.params.id);
  await prisma.note.delete({
    where: {
      id: id,
    },
  });
  response.status(204).end();
});

app.post("/api/notes", async (request, response) => {
  const note = request.body;
  const Note = await prisma.note.create({
    data: {
      content: note.content,
      important: note.important,
    },
  });

  response.status(201);
  response.json(Note);
});

/**There are also situations where we want to define middleware functions after routes.
 * In practice, this means that we are defining middleware functions that are only
 * called if no route handles the HTTP request. */
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

let PORT = 3001;
const HOSTNAME = "0.0.0.0";

if (process.env.NODE_ENV == "production") {
  PORT=8080;
}

app.listen(PORT, HOSTNAME);
console.log(`Server running on port ${PORT}`);
