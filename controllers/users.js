import { PrismaClient } from "@prisma/client";
import express from "express";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const users_router = express.Router();

users_router.get("/", async (_request, response) => {
  const users = await prisma.user.findMany({
    include: {
      notes: {
        select: {
          content: true,
          date: true,
        },
      },
    },
  });
  // console.log(users);
  response.json(users);
});

users_router.post("/", async (request, response, next) => {
  const { username, name, password } = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  try {
    const savedUser = await prisma.user.create({
      data: {
        username: username,
        passwordHash: passwordHash,
        name: name,
      },
    });

    response.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

users_router.get("/:id", async (request, response) => {
  const userid = request.params.id;
  const found = await prisma.user.findUnique({
    where: {
      id: userid,
    },
  });

  if (!found) {
    response.status(404).end();
  }
  response.json(found);
});

export default users_router;
