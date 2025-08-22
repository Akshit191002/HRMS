export enum LeaveType {
  Casual = "Casual",
  Sick = "Sick",
  Earned = "Earned",
  Unpaid = "Unpaid",
  Planned = "Planned",
  Privileged = "Privileged",
}

export enum ApprovalStatus {
  Pending = "Pending",
  Approved = "Approved",
  Declined = "Declined",
}

export interface LeaveBalance {
  allowedLeave: number;
  leaveTaken: number;
  unpaidLeave: number;
  balance: number;
}

export interface LeaveRequest {
  id?: string;
  employeeName: string;
  empCode: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  appliedOn?: string;
  department: string;
  myApprovalStatus?: ApprovalStatus;
  finalApprovalStatus?: ApprovalStatus;
  reason: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeLeaveRecord {
  empCode: string;
  leaveBalances: {
    [key in LeaveType]?: LeaveBalance;
  };
  lastUpdated: string;
}
