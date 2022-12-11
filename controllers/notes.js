import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const notes_Router = Router();

const prisma = new PrismaClient({
  errorFormat: "pretty",
});


notes_Router.get("/", (response) => {
  response.send("<h1>Hello World!</h1>");
});

notes_Router.get("/", async (response) => {
  const notes = await prisma.note.findMany();
  response.send(notes);
});

notes_Router.get("/:id", async (request, response) => {
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

notes_Router.delete("/:id", async (request, response) => {
  const id = String(request.params.id);
  await prisma.note.delete({
    where: {
      id: id,
    },
  });
  response.status(204).end();
});

notes_Router.post("/", async (request, response) => {
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
