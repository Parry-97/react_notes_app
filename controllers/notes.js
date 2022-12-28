import express from "express";
import authenticator from "../utils/auth.js";
import { PrismaClient } from "@prisma/client";

const notes_Router = express.Router();

const prisma = new PrismaClient({
  errorFormat: "pretty",
});

notes_Router.get(
  "/",
  authenticator.verifyToken,
  authenticator.verifyUser,
  async (_request, response) => {
    const notes = await prisma.note.findMany();
    response.send(notes);
  }
);

notes_Router.get(
  "/:id",
  authenticator.verifyToken,
  authenticator.verifyUser,
  async (request, response) => {
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
  }
);

notes_Router.delete(
  "/:id",
  authenticator.verifyToken,
  authenticator.verifyUser,
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

notes_Router.post(
  "/",
  authenticator.verifyToken,
  authenticator.verifyUser,
  async (request, response) => {
    console.log(request.body);
    const note = request.body.newNote;
    const Note = await prisma.note.create({
      data: {
        content: note.content,
        important: note.important,
      },
    });

    response.status(201);
    response.json(Note);
  }
);

export default notes_Router;
