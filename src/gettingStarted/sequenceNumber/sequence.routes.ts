import { Router } from "express";
import {
  addSequence,
  fetchSequences,
  updateSequence,
} from "./sequence.controller";
import { authenticateFirebaseUser } from "../../auth/middlewares/authenticateFirebaseUser";

const router = Router();

router.post("/create", authenticateFirebaseUser, addSequence);

router.get("/get", authenticateFirebaseUser, fetchSequences);

router.put("/update", authenticateFirebaseUser, updateSequence);

export default router;
