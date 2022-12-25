import express from "express";
import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const notes_Router = express.Router();

const prisma = new PrismaClient({
  errorFormat: "pretty",
});
const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};
const verifyToken = async (request, _response, next) => {
  const token = getTokenFrom(request);
  try {
    let decoded = jwt.verify(token, process.env.SECRET);
    // console.log(JSON.stringify(decoded));
    request.body = { ...request.body, decoded };
    next();
  } catch (error) {
    let customError = { statusCode: 401, message: "Unauthorized" };
    next(customError);
  }
};

const verifyUser = async (request, _response, next) => {
  // console.log(request.body);
  const userId = request.body.decoded.id;
  try {
    await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    next();
  } catch (error) {
    let customError = { statusCode: 401, message: "Unauthorized" };
    next(customError);
  }
};
notes_Router.get("/", verifyToken, verifyUser, async (_request, response) => {
  const notes = await prisma.note.findMany();
  response.send(notes);
});

notes_Router.get("/:id", verifyToken, verifyUser, async (request, response) => {
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

notes_Router.delete(
  "/:id",
  verifyToken,
  verifyUser,
  async (request, response) => {
    const id = String(request.params.id);
    await prisma.note.delete({
      where: {
        id: id,
      },
    });
    response.status(204).end();
  }
);

notes_Router.post("/", verifyToken, verifyUser, async (request, response) => {
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

export default notes_Router;
