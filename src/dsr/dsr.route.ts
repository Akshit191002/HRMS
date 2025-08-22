import { Router } from "express";
import { addDsr, fetchDsr, modifyDsr } from "./dsr.controller";
import { authenticateFirebaseUser } from "../auth/middlewares/authenticateFirebaseUser";
import { validateBody } from "../auth/middlewares/validateBody";
import { UserRole } from "../auth/constants/roles";
import { authorizeRole1 } from "../auth/middlewares/authorizeRole";

const router = Router();

router.post(
  "/create",
  authenticateFirebaseUser,
  authorizeRole1([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  validateBody([
    "empId",
    "date",
    "email",
    "submissionStatus",
    "myApprovalStatus",
  ]),
  addDsr
);

router.get("/get", authenticateFirebaseUser, fetchDsr);

router.put(
  "/update/:id",
  authenticateFirebaseUser,
  authorizeRole1([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  validateBody([
    "empId",
    "date",
    "email",
    "submissionStatus",
    "myApprovalStatus",
  ]),
  modifyDsr
);

// router.delete("/delete/:id", authenticateFirebaseUser, removeDsr);

export default router;
