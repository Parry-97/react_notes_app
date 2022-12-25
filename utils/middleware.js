import logger from "./logger.js";

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);
  if (error.name === "CastError") {
    response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    response.status(400).json({ error: error.message });
  } else if (error.name === "LoginError") {
    response.status(401).send({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    response.status(401).send({ error: error.message });
  } else if (error.name === "TokenExpiredError") {
    response.status(401).json({ error: "token expired" });
  } else {
    /* Notice that when not calling “next” in an error-handling function, you are
     * responsible for writing (and ending) the response. Otherwise those requests
     * will “hang” and will no be eligible for garbage collection. */
    response
      .status(error.statusCode || 500)
      .send({ error: error.message || "Internal error" });
  }
  /* If you pass an error to next() and you do not handle it in a custom error
   * handler, it will be handled by the built-in error handler; the error will
   * be written to the client with the stack trace. The stack trace is not
   * included in the production environment. */
  // next(error);
};

export { unknownEndpoint, errorHandler };
