import { Request, Response } from "express";
import {
  createLeave,
  deleteLeave,
  getAllLeave,
  updateLeave,
} from "./leave.service";

export const addLeave = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await createLeave(data);
    res.status(201).json({ message: "Leave configuration created", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to create leave configuration" });
  }
};

export const fetchLeave = async (req: Request, res: Response) => {
  try {
    const configs = await getAllLeave();
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leave configurations" });
  }
};

export const modifyLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await updateLeave(id, data);
    res.status(200).json({ message: "Leave configuration updated", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to update leave configuration" });
  }
};

export const removeLeave = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deleteLeave(id);
    res.status(200).json({ message: "Leave configuration deleted", result });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete leave configuration" });
  }
};
