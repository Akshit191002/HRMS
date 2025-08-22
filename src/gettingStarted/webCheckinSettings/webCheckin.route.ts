import { Router } from "express";
import { authenticateFirebaseUser } from "../../auth/middlewares/authenticateFirebaseUser";
import {
  fetchWebCheckinSettings,
  updateWebCheckinSettings,
} from "./webCheckin.controller";

const router = Router();

router.get("/get", authenticateFirebaseUser, fetchWebCheckinSettings);
router.put("/update", authenticateFirebaseUser, updateWebCheckinSettings);

export default router;
