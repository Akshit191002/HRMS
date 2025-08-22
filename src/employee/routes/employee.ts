import express from "express";
import * as employeeController from '../controller/employee';
import * as loanController from '../../loanAdvanced/controller/loan'
import { authenticateFirebaseUser } from "../../auth/middlewares/authenticateFirebaseUser";
import { BankDetailsSchema, changeStatusSchema, CreateEmployeeSchema, editGeneralInfoSchema, loginDetailsSchema, updateLoginDetailsSchema } from "../models/zodValidation/employee";
import { Gender, Title } from "../models/employees/employee.general";
import { upload } from "../../utils/upload.middleware";
import { validate } from "../../utils/validate";

const route = express.Router()
route.post('/create', authenticateFirebaseUser, validate(CreateEmployeeSchema), async (req, res) => {
  try {

    let { title, firstName, lastName, email, gender, phone, joiningDate, department, designation, role, location, reportingManager, workingPattern, holidayGroup, ctc, payslipComponent } = req.body;

    console.log("done....")
    const empCode = await employeeController.generateEmpId();
    if (!lastName) {
      lastName = firstName;
    }

    const generalData = {
      empCode,
      name: {
        title: title as Title,
        first: firstName.trim(),
        last: lastName.trim()
      },
      primaryEmail: email,
      gender: gender as Gender,
      phoneNum: {
        code: "+91",
        num: phone
      }
    };

    const professionalData = {
      joiningDate, department,
      designation, location,
      reportingManager, holidayGroup,
      workWeek: workingPattern,
      ctcAnnual: ctc, role,
      payslipComponent
    };

    const employee = await employeeController.addEmployee(generalData, professionalData);
    res.status(201).json(employee);

  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

route.get('/getAll', authenticateFirebaseUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    if (isNaN(limit) || isNaN(page)) {
      return res.status(400).json({ error: "Invalid or missing 'limit' or 'page' query parameters" });
    }

    const employees = await employeeController.getAllEmployees(limit, page);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.get('/get/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const data = await employeeController.getEmployeeById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

route.patch('/status/:id', authenticateFirebaseUser, validate(changeStatusSchema), async (req, res) => {
  try {
    const status = req.body
    const data = await employeeController.changeStatus(req.params.id, status);
    res.status(200).json(data);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
})

route.delete('/delete/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const data = await employeeController.deleteEmployee(req.params.id);
    res.status(204).json(data);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
})

route.patch('/general/:id', authenticateFirebaseUser, validate(editGeneralInfoSchema), async (req, res) => {
  try {
    const data = req.body
    const updated = await employeeController.editGeneralInfo(req.params.id, data);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

route.patch('/general/login-details/:id', authenticateFirebaseUser, validate(updateLoginDetailsSchema), async (req, res) => {
  try {
    const data = req.body
    const updated = await employeeController.editLoginDetails(req.params.id, data);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

route.post('/general/login-details/:id', authenticateFirebaseUser, validate(loginDetailsSchema), async (req, res) => {
  try {
    const data = req.body
    const updated = await employeeController.addLoginDetails(req.params.id, data);
    res.status(201).json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
})

route.patch('/professional/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const updated = await employeeController.editProfessionalInfo(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

route.post('/bank/:id', authenticateFirebaseUser, async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const parsed = BankDetailsSchema.safeParse(data);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid bank data",
      details: parsed.error.format()
    });
  }

  try {
    const bank = await employeeController.addBankDetails(id, data)
    res.status(201).json(bank);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }

})

route.patch('/bank/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const updated = await employeeController.editBankDetails(req.params.id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

route.get('/all/:code', authenticateFirebaseUser, async (req, res) => {
  try {
    const data = await employeeController.getCompleteEmployeeDetailsByCode(req.params.code);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
})

route.post('/loan/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const bank = await loanController.createLoanRequest(req.params.id, req.body)
    res.status(201).json(bank);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
})

route.post('/approvedLoan/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const bank = await loanController.approvedLoan(req.params.id, req.body)
    res.status(201).json(bank);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
})

route.post('/cancelLoan/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const bank = await loanController.cancelLoan(req.params.id, cancelReason)
    res.status(200).json(bank);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
})

route.patch('/loan/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const bank = await loanController.editLoan(req.params.id, req.body)
    res.status(201).json(bank);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
})

route.post('/proviousJob/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const bank = await employeeController.addPreviousJob(req.params.id, req.body)
    res.status(201).json(bank);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
})

route.patch('/proviousJob/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const bank = await employeeController.editPreviousJob(req.params.id, req.body)
    res.status(201).json(bank);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
})

route.post('/upload-pic/:id', authenticateFirebaseUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const pic = await employeeController.uploadProfilePicture(req.params.id, req.file)
    res.status(201).json(pic);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
})

export default route;