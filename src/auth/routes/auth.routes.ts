import { Router } from "express";
import {
  login,
  logout,
  refreshToken,
  signupSuperAdmin,
} from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validateBody";

const router = Router();

router.post(
  "/signup/super-admin",
  validateBody(["email", "password", "displayName"]),
  signupSuperAdmin
);

router.post("/login", validateBody(["email", "password"]), login);

router.post("/refresh", validateBody(["refreshToken"]), refreshToken);

router.post("/logout", logout);

export default router;
