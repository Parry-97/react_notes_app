import app from "./app.js";
import http from "http";
import logger from "./utils/logger.js";

const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  logger.info(`Server is listening on port ${process.env.PORT}`);
});
