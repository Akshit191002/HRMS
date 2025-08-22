export interface DSR {
  id?: string;
  empId: string;
  employeeName?: string;
  email: string;
  department: string;
  designation: string;
  date: number;
  description: string;
  totalLoggedHours: string;
  submissionStatus: "Submitted" | "Due" | "Due-On Leave";
  myApprovalStatus: "Pending";
  projects?: string;
  createdAt: number;
  declineReason?: string;
  // updatedAt?: number;
}
