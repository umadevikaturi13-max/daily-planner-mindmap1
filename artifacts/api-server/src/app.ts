import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { pinoHttp } from "pino-http"; 
import router from "./routes/index.js"; 
/* 
import router from "./routes";
*/
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: Request) { // Added : Request
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?"),
        };
      },
      res(res: Response) { // Added : Response
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// ... keep the rest of your app.use and export code below this ...
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;

