import { RequestHandler, Router } from "express";
import { FarmController } from "modules/farms/farms.controller";

const router = Router();
const farmController = new FarmController();

router.post("/", farmController.addFarm.bind(farmController) as RequestHandler);
router.get("/", farmController.getFarm.bind(farmController) as RequestHandler);

export default router;