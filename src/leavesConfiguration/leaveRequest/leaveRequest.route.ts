import { Router } from "express";
import {
  addLeaveRequest,
  fetchLeaveRequests,
  modifyLeaveRequest,
} from "./leaveRequest.controller";
import { authenticateFirebaseUser } from "../../auth/middlewares/authenticateFirebaseUser";
import { UserRole } from "../../auth/constants/roles";
import { validateBody } from "../../auth/middlewares/validateBody";
import { authorizeRole1 } from "../../auth/middlewares/authorizeRole";

const router = Router();

// Create Leave Request
router.post(
  "/create",
  authenticateFirebaseUser,
  authorizeRole1([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  validateBody(["empCode", "leaveType", "startDate", "endDate", "reason"]),
  addLeaveRequest
);

// Get Leave Requests
router.get("/get", authenticateFirebaseUser, fetchLeaveRequests);

// Update Leave Request
router.put(
  "/update/:id",
  authenticateFirebaseUser,
  authorizeRole1([UserRole.SUPER_ADMIN, UserRole.ADMIN]),
  validateBody(["myApprovalStatus", "finalApprovalStatus"]),
  modifyLeaveRequest
);

export default router;
