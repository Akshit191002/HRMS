import express from "express";
import * as attendanceController from '../controller/attendance';

import { authenticateFirebaseUser } from "../../auth/middlewares/authenticateFirebaseUser";


const route = express.Router()

route.post('/create', authenticateFirebaseUser, async (req, res) => {
    try {
        const records = req.body.records;
        if (!Array.isArray(records)) {
            return res.status(400).json({ error: "Invalid input format" });
        }
        const attendance = await attendanceController.addAttendance(records);
        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

route.get('/getAll', authenticateFirebaseUser, async (req, res) => {
    try {
        const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

        if (isNaN(year)) {
            return res.status(400).json({ error: "Invalid year format" });
        }
        const attendance = await attendanceController.getYearlyAttendance(Number(year))
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

route.post('/missing', authenticateFirebaseUser, async (req, res) => {
    try {
        const { year, month } = req.body
        const attendance = await attendanceController.fillMissingAttendance(year, month);
        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

route.post('/create/leave', authenticateFirebaseUser, async (req, res) => {
    try {
        const records = req.body.records;
        if (!Array.isArray(records)) {
            return res.status(400).json({ error: "Invalid input format" });
        }
        const attendance = await attendanceController.addAttendanceWithLeave(records);
        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

route.get('/get/:code', authenticateFirebaseUser, async (req, res) => {
    try {
        const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

        if (isNaN(year)) {
            return res.status(400).json({ error: "Invalid year format" });
        }
        const code = req.params.code
        const attendance = await attendanceController.getEmployeeAttendance(code, Number(year))
        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default route