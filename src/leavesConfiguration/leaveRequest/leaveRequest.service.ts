import { Request } from "express";
import {
  ApprovalStatus,
  EmployeeLeaveRecord,
  LeaveRequest,
  LeaveType,
} from "./leaveRequest.model";
import { firestore } from "firebase-admin";
import logger from "../../utils/logger";

const db = firestore();
const leaveRequestCollection = db.collection("leaveRequest");
const employeeLeaveCollection = db.collection("employeeLeaveBalances");

/**
 * Create a new leave request
 */
export const createLeaveRequest = async (req: Request): Promise<string> => {
  try {
    const {
      empCode,
      employeeName,
      department,
      startDate,
      endDate,
      leaveType,
      reason,
      leaveBalances,
    } = req.body;

    // Validate required fields
    if (
      !empCode ||
      !employeeName ||
      !department ||
      !startDate ||
      !endDate ||
      !leaveType
    ) {
      throw new Error(
        "Missing required fields: employeeId, startDate, endDate, leaveType"
      );
    }

    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    if (end < start) {
      throw new Error("End date cannot be before start date");
    }

    // Calculate total leave days (inclusive)
    const duration =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Create leave request object
    const newLeave: LeaveRequest = {
      empCode,
      employeeName,
      department,
      startDate,
      endDate,
      leaveType,
      reason,
      appliedOn: new Date().toISOString(),
      myApprovalStatus: ApprovalStatus.Pending,
      finalApprovalStatus: ApprovalStatus.Pending,
      duration: duration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const leaveRef = leaveRequestCollection.doc();
    await leaveRef.set(newLeave);

    if (leaveBalances && typeof leaveBalances === "object") {
      const record: EmployeeLeaveRecord = {
        empCode,
        leaveBalances: leaveBalances as any,
        lastUpdated: new Date().toISOString(),
      };
      // merge: true so we don't overwrite other fields accidentally
      await employeeLeaveCollection.doc(empCode).set(record, { merge: true });
    }

    logger.info(`Leave request created for employee ${empCode}`);
    return leaveRef.id;
  } catch (error) {
    logger.error("Error creating leave request:", error);
    throw error;
  }
};

/**
 * Get all leave requests
 */
// export const getLeaveRequests = async (filters?: {
//   empCode?: string;
//   leaveType?: LeaveType;
//   finalApprovalStatus?: ApprovalStatus;
//   department?: string;
// }): Promise<LeaveRequest[]> => {
//   let query: FirebaseFirestore.Query = leaveRequestCollection;

//   if (filters?.empCode) {
//     query = query.where("empCode", "==", filters.empCode);
//   }

//   if (filters?.leaveType) {
//     query = query.where("leaveType", "==", filters.leaveType);
//   }

//   if (filters?.finalApprovalStatus) {
//     query = query.where(
//       "finalApprovalStatus",
//       "==",
//       filters.finalApprovalStatus
//     );
//   }

//   if (filters?.department) {
//     query = query.where("department", "==", filters.department);
//   }

//   try {
//     const snapshot = await query.get();
//     const leaveReq = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as LeaveRequest[];

//     leaveReq.sort((a, b) => {
//       const appliedOnDiff =
//         new Date(b.appliedOn || "").getTime() -
//         new Date(a.appliedOn || "").getTime();

//       if (appliedOnDiff === 0) {
//         return (
//           new Date(b.createdAt || "").getTime() -
//           new Date(a.createdAt || "").getTime()
//         );
//       }

//       return appliedOnDiff;
//     });

//     return leaveReq;
//   } catch (error) {
//     logger.error("Error fetching leave requests:", error);
//     throw error;
//   }
// };

export const getLeaveRequestsWithBalance = async (filters?: {
  empCode?: string;
  leaveType?: LeaveType;
  finalApprovalStatus?: ApprovalStatus;
  department?: string;
}) => {
  let query: FirebaseFirestore.Query = leaveRequestCollection;

  // filters lagao
  if (filters?.empCode) query = query.where("empCode", "==", filters.empCode);
  if (filters?.leaveType)
    query = query.where("leaveType", "==", filters.leaveType);
  if (filters?.finalApprovalStatus)
    query = query.where(
      "finalApprovalStatus",
      "==",
      filters.finalApprovalStatus
    );
  if (filters?.department)
    query = query.where("department", "==", filters.department);

  try {
    // Pehle leave requests nikaalo
    const snapshot = await query.get();
    const leaveRequests = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LeaveRequest[];

    // Unique empCodes nikaalo
    const empCodes = [...new Set(leaveRequests.map((l) => l.empCode))];

    // Unke leave balances laao
    const balancesSnap = await Promise.all(
      empCodes.map((empCode) => employeeLeaveCollection.doc(empCode).get())
    );

    const balancesMap: Record<string, EmployeeLeaveRecord> = {};
    balancesSnap.forEach((snap) => {
      if (snap.exists) {
        balancesMap[snap.id] = snap.data() as EmployeeLeaveRecord;
      }
    });

    // Merge karo
    const mergedData = leaveRequests.map((req) => ({
      ...req,
      leaveBalance: balancesMap[req.empCode]?.leaveBalances || {},
    }));

    // Sorting (same as before)
    mergedData.sort((a, b) => {
      const appliedOnDiff =
        new Date(b.appliedOn || "").getTime() -
        new Date(a.appliedOn || "").getTime();
      if (appliedOnDiff === 0) {
        return (
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
        );
      }
      return appliedOnDiff;
    });

    return mergedData;
  } catch (error) {
    logger.error("Error fetching leave requests with balance:", error);
    throw error;
  }
};

/**
 * Update leave request status
 */
export const updateLeaveRequestStatus = async (
  id: string,
  updates: {
    myApprovalStatus?: ApprovalStatus;
    finalApprovalStatus?: ApprovalStatus;
    declineReason?: string;
  }
): Promise<boolean> => {
  try {
    const leaveRef = leaveRequestCollection.doc(id);
    const docSnap = await leaveRef.get();

    if (!docSnap.exists) {
      throw new Error("Leave request not found");
    }
    const existing = docSnap.data() as LeaveRequest;

    // Decline reason validation (either myApprovalStatus or finalApprovalStatus)
    if (
      (updates.myApprovalStatus === ApprovalStatus.Declined ||
        updates.finalApprovalStatus === ApprovalStatus.Declined) &&
      !updates.declineReason?.trim()
    ) {
      throw new Error("Decline reason is required when rejecting");
    }

    // Update leave balances if approved
    if (updates.finalApprovalStatus === ApprovalStatus.Approved) {
      await adjustLeaveBalance(
        existing.empCode,
        existing.leaveType,
        existing.duration
      );
    }

    await leaveRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    logger.info(`Leave request ${id} updated: ${JSON.stringify(updates)}`);
    return true;
  } catch (error) {
    logger.error("Error updating leave request:", error);
    throw error;
  }
};

/**
 * Adjust employee leave balance when leave approved
 */
export const adjustLeaveBalance = async (
  empCode: string,
  leaveType: LeaveType,
  days: number
) => {
  const recordRef = employeeLeaveCollection.doc(empCode);
  const recordSnap = await recordRef.get();

  if (!recordSnap.exists) {
    throw new Error(`Leave balance record not found for ${empCode}`);
  }

  const record = recordSnap.data() as EmployeeLeaveRecord;

  if (!record.leaveBalances[leaveType]) {
    throw new Error(`No balance found for leave type: ${leaveType}`);
  }

  // Deduct leave days
  record.leaveBalances[leaveType]!.leaveTaken += days;
  record.leaveBalances[leaveType]!.balance =
    record.leaveBalances[leaveType]!.allowedLeave -
    record.leaveBalances[leaveType]!.leaveTaken;
  record.lastUpdated = new Date().toISOString();

  await recordRef.set(record);
};
