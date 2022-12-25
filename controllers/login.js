import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import express from "express";

const login_router = express.Router();
const prisma = new PrismaClient();

const checkUsernameExists = async (request, _response, next) => {
  const { username, password } = request.body;
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });

  if (!user) {
    let error = { name: "LoginError", message: "Invalid username" };
    // response.status(401).send(error);
    next(error);
  } else {
    request.body = {
      user,
      password,
    };
    next();
  }
};

const checkPasswordCorrect = async (request, _response, next) => {
  const password = request.body.password;
  const user = request.body.user;
  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordCorrect) {
    //Could create some helper functions to facilitate the creation of
    //these error messages
    let error = { name: "LoginError", message: "Invalid password" };
    // response.status(401).send(error);
    // Error handling has been moved to the dedicated middleware thanks to next
    next(error);
  } else {
    request.body = user;
    next();
  }
};

login_router.post(
  "/",
  checkUsernameExists, //the two callback in front are middleware functions that will be
  checkPasswordCorrect, //executed before the actual route code and will process it like
  //every other middleware (before the main logic)
  async (request, response) => {
    const user = request.body;
    const userForToken = {
      username: user.username,
      id: user.id,
    };

    // The token has been digitally signed using a string from the environment
    // variable SECRET as the secret. The digital signature ensures that only
    // parties who know the secret can generate a valid token. The value for the
    // environment variable must be set in the .env file.
    // console.log(process.env.SECRET);
    const token = jwt.sign(userForToken, process.env.SECRET, {
      expiresIn: 60 * 60,
    });
    // console.log(token);
    response.status(200).json({
      token, //this is a cheeky js thing, it automatically assigns a field to the JSON object
      username: user.username,
      name: user.name,
    });
  }
);
// login_router.use(errorHandler);
export default login_router;
