import express from "express";
import dotenv from "dotenv";
import authRoutes from "./auth/routes/auth.routes";
import departmentRoutes from "./gettingStarted/department/department.routes";
import designationRoutes from "./gettingStarted/designation/designation.routes";
import organizationSettingsRoutes from "./gettingStarted/orgSetting/organization.routes";
import workingPatternRoutes from "./gettingStarted/workingPattern/workingPattern.routes";
import locationRoutes from "./gettingStarted/location/location.routes";
import holidayConfigurationRoutes from "./gettingStarted/holidayConfiguration/holidayConfig.routes";
import holidayCalendarRoutes from "./gettingStarted/holidayCalendar/holidayCalendar.routes";
import rolesRoutes from "./gettingStarted/roles/roles.routes";
import sequenceNumberRoutes from "./gettingStarted/sequenceNumber/sequence.routes";
import leaveRoutes from "./leavesConfiguration/leaves/leave.routes";
import DsrRoutes from "./dsr/dsr.route";
import leaveRequestRoutes from "./leavesConfiguration/leaveRequest/leaveRequest.route";
import webCheckinSettingsRoutes from "./gettingStarted/webCheckinSettings/webCheckin.route";
import cors from "cors";
import helmet from "helmet";
import employeeRoutes from './employee/routes/employee'
import projectRoutes from './project/routes/project'
import loanRoutes from './loanAdvanced/routes/loan'
import componentRoutes from './gettingStarted/payslipComponent/routes/payslip'
import attendanceRoutes from './attendance/routes/attendance'
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(helmet());
app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/organization-settings", organizationSettingsRoutes);
app.use("/api/working-patterns", workingPatternRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/holidayConfiguraion", holidayConfigurationRoutes);
app.use("/api/holidayCalendar", holidayCalendarRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/sequenceNumber", sequenceNumberRoutes);
app.use('/payslip', componentRoutes)
app.use("/api/webCheckinSettings", webCheckinSettingsRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/dsr", DsrRoutes);
app.use("/api/leaveRequest", leaveRequestRoutes);
app.use('/employees', employeeRoutes)
app.use('/project', projectRoutes)
app.use('/loan', loanRoutes)
app.use('/attendance', attendanceRoutes)

app.get("/", (req, res) => {
  res.status(200).send("Firebase Auth Backend is Running!");
});

app.listen(PORT, () => {
  console.log(`Payroll portal is running at http://localhost:${PORT}`);
});
