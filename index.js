import app from "./app.js";
import http from "http";
import { info } from "./utils/logger";

let PORT = 3001;

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV == "production") {
  PORT = 8080;
}

const server = http.createServer(app);
server.listen(PORT, () => {
  info(`Server is listening on port ${PORT}`);
})

