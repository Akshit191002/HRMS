import { Request, Response } from "express";
import {
  getWebCheckinSettings,
  putWebCheckinSettings,
} from "./webCheckin.service";

export const fetchWebCheckinSettings = async (req: Request, res: Response) => {
  try {
    const settings = await getWebCheckinSettings();
    if (!settings) {
      return res
        .status(404)
        .json({ message: "Web check-in settings not found" });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching settings", error });
  }
};

export const updateWebCheckinSettings = async (req: Request, res: Response) => {
  try {
    const { shiftStartTime, shiftEndTime } = req.body;

    if (!shiftStartTime || !shiftEndTime) {
      return res
        .status(400)
        .json({ message: "shiftStartTime and shiftEndTime are required" });
    }

    const id = await putWebCheckinSettings({ shiftStartTime, shiftEndTime });
    res.json({ message: "Web check-in settings saved successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Error updating settings", error });
  }
};
