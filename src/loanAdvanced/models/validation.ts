import { z } from "zod";
import { LoanStatus } from "../models/loan"

export const createLoanSchema = z.object({
  empName: z.string().min(1, "Employee name is required"),
  reqDate: z.string().min(1, "Request date is required"),
  status: z.nativeEnum(LoanStatus).default(LoanStatus.PENDING),
  amountReq: z.string().min(1, "Requested amount is required"),
  amountApp: z.string().optional(),
  balance: z.string().optional(),
  paybackTerm: z
    .object({
      installment: z.string(),
      date: z.string(),
      remaining: z.string(),
    })
    .optional(),
  approvedBy: z.string().optional(),
  staffNote: z.string().optional(),
  note: z.string().optional(),
  activity: z.array(z.string()).optional(),
  cancelReason: z.string().optional(),
  isDeleted: z.boolean().optional(),
});

export const updateLoanSchema = createLoanSchema.partial();

export const cancelLoanSchema = z.object({
  cancelReason: z.string().min(1, "Cancel reason is required"),
});
