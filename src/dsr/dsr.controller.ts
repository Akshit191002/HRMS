import { Request, Response } from "express";
import { createDSR, getDSRList, updateDSRById } from "./dsr.service";
import { DSR } from "./dsr.model";
import logger from "../utils/logger";

export const addDsr = async (req: Request, res: Response) => {
  try {
    const data = req.body as DSR;

    if (
      !data.empId ||
      !data.date ||
      !data.description ||
      !data.submissionStatus
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await createDSR(data);
    res.status(201).json({ message: "DSR created successfully", result });
  } catch (error) {
    logger.error("Error creating DSR:", error);
    res.status(500).json({ error: "Failed to create DSR" });
  }
};

export const fetchDsr = async (req: Request, res: Response) => {
  try {
    const { empId, projects, date, submissionStatus, myApprovalStatus } =
      req.query;

    const filters: { [key: string]: string } = {};

    if (empId) filters.empId = String(empId);
    if (date) filters.date = String(date);
    if (projects) filters.projects = String(projects);
    if (submissionStatus) filters.submissionStatus = String(submissionStatus);
    if (myApprovalStatus) filters.myApprovalStatus = String(myApprovalStatus);

    const result = await getDSRList(filters);

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(404).json({ message: "No DSR found" });
    }

    res.status(200).json(result);
  } catch (error) {
    logger.error("Error fetching DSR(s):", error);
    res.status(500).json({ error: "Failed to fetch DSR(s)" });
  }
};

export const modifyDsr = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.myApprovalStatus === "Declined" && !data.declineReason) {
      return res.status(400).json({ error: "Decline reason is required" });
    }

    await updateDSRById(id, data);
    res.status(200).json({ message: "DSR updated successfully", id });
  } catch (error) {
    logger.error("Error updating DSR:", error);
    res.status(500).json({ error: "Failed to update DSR" });
  }
};

// export const removeDsr = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     await deleteDSRById(id);
//     res.status(200).json({ message: "DSR deleted successfully", id });
//   } catch (error) {
//     logger.error("Error deleting DSR:", error);
//     res.status(500).json({ error: "Failed to delete DSR" });
//   }
// };
