export interface LeaveConfiguration {
  id?: string;
  leaveType: string;
  leaveCount: number;
  isCarryForward: boolean;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}
