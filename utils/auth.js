import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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
    request.body.decoded = decoded;
    next();
  } catch (error) {
    console.log(error);
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
    console.error(error);
    let customError = { statusCode: 401, message: "Unauthorized" };
    next(customError);
  }
};

export default { verifyToken, verifyUser };
