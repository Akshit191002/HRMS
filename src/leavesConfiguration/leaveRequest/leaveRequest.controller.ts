import { Request, Response } from "express";
import {
  createLeaveRequest,
  getLeaveRequestsWithBalance,
  updateLeaveRequestStatus,
} from "./leaveRequest.service";
import { LeaveRequest, ApprovalStatus } from "./leaveRequest.model";
import logger from "../../utils/logger";

// Add a new leave request
export const addLeaveRequest = async (req: Request, res: Response) => {
  try {
    // const { empCode, startDate, endDate, leaveType, reason } =
    //   req.body as LeaveRequest;

    // //Required field validation
    // if (
    //   !empCode?.trim() ||
    //   !leaveType ||
    //   !startDate ||
    //   !endDate ||
    //   !reason?.trim()
    // ) {
    //   return res.status(400).json({ error: "Missing required fields" });
    // }

    const id = await createLeaveRequest(req);
    return res.status(201).json({
      message: "Leave request created successfully",
      id,
    });
  } catch (error) {
    logger.error("Error creating leave request:", error);
    return res.status(500).json({
      error: (error as Error).message || "Failed to create leave request",
    });
  }
};

/**
 * Fetch leave requests with optional filters
 */
export const fetchLeaveRequests = async (req: Request, res: Response) => {
  try {
    const { empCode, leaveType, finalApprovalStatus, department } = req.query;

    const filters: Record<string, string> = {};
    if (empCode) filters.empCode = String(empCode);
    if (leaveType) filters.leaveType = String(leaveType);
    if (finalApprovalStatus)
      filters.finalApprovalStatus = String(finalApprovalStatus);
    if (department) filters.department = String(department);

    const result = await getLeaveRequestsWithBalance(filters);

    return res.status(200).json({
      message: "Leave requests fetched successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching leave requests:", error);
    return res.status(500).json({
      error: (error as Error).message || "Failed to fetch leave requests",
    });
  }
};

/**
 * Modify leave request status or details
 */
export const modifyLeaveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { myApprovalStatus, finalApprovalStatus, declineReason } = req.body;

    // Validation: Decline reason is required if rejected
    if (
      (myApprovalStatus === ApprovalStatus.Declined ||
        finalApprovalStatus === ApprovalStatus.Declined) &&
      !declineReason?.trim()
    ) {
      return res
        .status(400)
        .json({ error: "Decline reason is required when rejecting" });
    }

    // Prepare update payload
    const updates: {
      myApprovalStatus?: ApprovalStatus;
      finalApprovalStatus?: ApprovalStatus;
      declineReason?: string;
    } = {
      myApprovalStatus,
      finalApprovalStatus,
    };

    if (
      (myApprovalStatus === ApprovalStatus.Declined ||
        finalApprovalStatus === ApprovalStatus.Declined) &&
      declineReason
    ) {
      updates.declineReason = declineReason.trim();
    }

    await updateLeaveRequestStatus(id, updates);

    return res
      .status(200)
      .json({ message: "Leave request updated successfully", id });
  } catch (error) {
    logger.error("Error updating leave request:", error);
    return res.status(500).json({
      error: (error as Error).message || "Failed to update leave request",
    });
  }
};
