import { Router } from "express";
import {
  addLeave,
  fetchLeave,
  modifyLeave,
  removeLeave,
} from "./leave.controller";
import { authenticateFirebaseUser } from "../../auth/middlewares/authenticateFirebaseUser";
import { validateBody } from "../../auth/middlewares/validateBody";
import { UserRole } from "../../auth/constants/roles";
import { authorizeRole1 } from "../../auth/middlewares/authorizeRole";

const router = Router();

router.post(
  "/create",
  authenticateFirebaseUser,
  authorizeRole1([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  validateBody(["leaveType", "leaveCount", "isCarryForward"]),
  addLeave
);

router.get("/get", authenticateFirebaseUser, fetchLeave);

router.put(
  "/update/:id",
  authenticateFirebaseUser,
  authorizeRole1([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  validateBody(["leaveType", "leaveCount", "isCarryForward"]),
  modifyLeave
);

router.delete("/delete/:id", authenticateFirebaseUser, removeLeave);

export default router;
