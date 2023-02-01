import { RequestHandler, Router } from "express";
import { JwtMiddleware } from "middlewares/jwt-middleware";
import { FarmController } from "modules/farms/farms.controller";

const router = Router();
const farmController = new FarmController();
const jwtMiddleware = new JwtMiddleware();

router.post(
  "/",
  jwtMiddleware.verifyToken.bind(jwtMiddleware) as RequestHandler,
  farmController.addFarm.bind(farmController) as RequestHandler,
);
router.delete(
  "/",
  jwtMiddleware.verifyToken.bind(jwtMiddleware) as RequestHandler,
  farmController.deleteFarm.bind(farmController) as RequestHandler,
);

router.get(
  "/sortedFarm",
  jwtMiddleware.verifyToken.bind(jwtMiddleware) as RequestHandler,
  farmController.getFarm.bind(farmController) as RequestHandler,
);


router.get(
    "/filteredFarm",
    jwtMiddleware.verifyToken.bind(jwtMiddleware) as RequestHandler,
    farmController.filterFarm.bind(farmController) as RequestHandler,
  );

export default router;
