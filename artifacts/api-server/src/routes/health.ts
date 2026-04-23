/* import { Router, type IRouter, type Request, type Response } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req: Request, res: Response) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
*/

import { Router, Request, Response } from "express";
const router = Router();

router.get("/healthz", (req: Request, res: Response) => {
  // Comment out the workspace import logic temporarily
  // const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({ status: "ok" }); 
});

export default router;
