import { db } from '../firebase/firebase';
import { collection, doc, getDocs, writeBatch, query, where, getDoc, updateDoc, } from 'firebase/firestore';
import { General, Status } from '../models/employees/employee.general';
import { Professional } from '../models/employees/employee.professional';
import { Employee } from '../models/employees/employee';
import { BankDetails } from '../models/employees/employee.bankDetails';
import { Loan, LoanStatus } from '../models/loan';
import { JOB } from '../models/employees/employee.job';


const generalCollection = collection(db, 'general');
const professionalCollection = collection(db, 'professional')
const employeeCollection = collection(db, 'employees')
const bankDetailsCollection = collection(db, 'bankDetails')
const pfCollection = collection(db, 'pfDetails')
const loanCollection = collection(db, 'loanDetails')
const previousCollection = collection(db,'previousJobs')
const departmentPrefixMap: Record<string, string> = {
  "HR": "HR",
  "Finance": "FN",
  "Engineering": "EN",
  "Sales": "SL",
  "Marketing": "MK"
};

const padNumber = (num: number) => num.toString().padStart(4, '0');

export const generateEmpId = async (department: string): Promise<string> => {
  const prefix = departmentPrefixMap[department] || "UN";

  const snapshot = await getDocs(generalCollection);
  const empIds = snapshot.docs
    .map(doc => doc.data().empCode)
    .filter((id: string) => id.startsWith(prefix));

  const maxNumber = empIds.reduce((max, id) => {
    const num = parseInt(id.slice(2));
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);

  const nextNumber = maxNumber + 1;

  return `${prefix}${padNumber(nextNumber)}`;
};

export const addEmployee = async (
  generalData: Partial<General>,
  professinalData: Partial<Professional>) => {

  const { name, empCode, primaryEmail, gender, phoneNum } = generalData;
  const { joiningDate, department, designation, location, reportingManager, workWeek, holidayGroup, ctcAnnual, payslipComponent } = professinalData;

  if (!name || !empCode || !primaryEmail || !gender || !phoneNum || !joiningDate || !department || !designation || !location || !reportingManager || !workWeek || !holidayGroup || !ctcAnnual || !payslipComponent) {
    throw new Error('Missing required employee fields');
  }

  const general: General = { name, empCode, primaryEmail, gender, phoneNum, status: generalData.status || Status.ACTIVE };
  const professional: Professional = { joiningDate, department, designation, location, reportingManager, workWeek, holidayGroup, ctcAnnual, payslipComponent };

  const generalRef = doc(generalCollection);
  const professionalRef = doc(professionalCollection);
  const employeeRef = doc(employeeCollection);


  const batch = writeBatch(db);

  batch.set(generalRef, general);
  batch.set(professionalRef, professional);
  batch.set(employeeRef, {
    generalId: generalRef.id,
    professionalId: professionalRef.id,
    isDeleted: false
  } satisfies Employee);

  batch.update(generalRef, {
    id: generalRef.id
  })
  batch.update(professionalRef, {
    id: professionalRef.id
  })

  await batch.commit();

  return {
    msg: 'successfully created'
  };

};

export const getAllEmployees = async () => {
  const employeeSnapshot = await getDocs(employeeCollection);

  const employees = await Promise.all(
    employeeSnapshot.docs.map(async (employeeDoc) => {
      const employeeData = employeeDoc.data();
      if (employeeData.isDeleted) return null;

      const generalRef = doc(db, generalCollection.path, employeeData.generalId);
      const professionalRef = doc(db, professionalCollection.path, employeeData.professionalId);

      const [generalSnap, professionalSnap] = await Promise.all([
        getDoc(generalRef),
        getDoc(professionalRef),
      ]);
      const general = generalSnap.exists() ? generalSnap.data() : null;
      const professional = professionalSnap.exists() ? professionalSnap.data() : null;
      if (!general || !professional) return null;
      return {
        id: employeeDoc.id,
        employeeCode: general.empCode,
        employeeName: `${general.name?.first || ''} ${general.name?.last || ''}`.trim(),
        joiningDate: professional.joiningDate,
        designation: professional.designation,
        department: professional.department,
        location: professional.location,
        gender: general.gender,
        status: general.status,
        payslipComponent: professional.payslipComponent
      };
    }))
  return employees.filter(Boolean)
};

export const deleteEmployee = async (id: string) => {
  const employeeRef = doc(employeeCollection, id);
  const batch = writeBatch(db);
  batch.update(employeeRef, {
    isDeleted: true
  })
  await batch.commit();
  return {
    message: "employee deleted"
  }
}

export const getEmployeeById = async (id: string) => {
  const docRef = doc(employeeCollection, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error("Employee not found");

  const data = docSnap.data();
  return {
    employeeId: id,
    generalId: data.generalId,
    professionalId: data.professionalId,
    bankDetailId: data.bankDetailId,
    pfId: data.pfId,
    loanId: data.loanId
  };
};

export const editGeneralInfo = async (id: string, updateData: Partial<General>) => {
  const ref = doc(generalCollection, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("General info not found");

  await updateDoc(ref, updateData);
  return { message: "General info updated successfully" };
};

export const changeStatus = async (id: string, status: string) => {
  const data = await getEmployeeById(id)
  const generalId = data.generalId;
  const professinalId = data.professionalId

  const genneralRef = doc(generalCollection, generalId);
  const professionalRef = doc(professionalCollection, professinalId)
  const batch = writeBatch(db);
  batch.update(genneralRef, {
    status
  })
  await batch.commit();
  // return{
  //   message:"change status"
  // }
  const [generalSnap, professionalSnap] = await Promise.all([
    getDoc(genneralRef),
    getDoc(professionalRef),
  ]);
  const general = generalSnap.exists() ? generalSnap.data() : null;
  const professional = professionalSnap.exists() ? professionalSnap.data() : null;
  if (!general || !professional) return null;

  return {
    id: id,
    employeeCode: general.empCode,
    employeeName: `${general.name?.first || ''} ${general.name?.last || ''}`.trim(),
    joiningDate: professional.joiningDate,
    designation: professional.designation,
    department: professional.department,
    location: professional.location,
    gender: general.gender,
    status: general.status,
    payslipComponent: professional.payslipComponent
  };
}

export const editProfessionalInfo = async (id: string, updateData: Partial<Professional>) => {
  const ref = doc(professionalCollection, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Professoinal info not found");

  await updateDoc(ref, updateData);
  return { message: "Professional info updated successfully" };
};

export const addBankDetails = async (Id: string, data: Partial<BankDetails>) => {
  const { accountType, accountName, accountNum, ifscCode, bankName, branchName } = data;

  if (!accountType || !accountName || !ifscCode || !bankName || !accountNum || !branchName) {
    throw new Error("Missing required bank detail fields");
  }

  const employeeRef = doc(employeeCollection, Id);
  const employeeSnap = await getDoc(employeeRef);

  if (!employeeSnap.exists()) {
    throw new Error("Employee not found");
  }

  const employeeData = employeeSnap.data();

  if (employeeData.bankDetailId) {
    return {
      bankDetailId: employeeData.bankDetailId,
      message: "Bank details already exist for this employee"
    };
  }
  const bankRef = doc(bankDetailsCollection);
  const batch = writeBatch(db);

  batch.set(bankRef, {
    accountType,
    accountName,
    accountNum,
    ifscCode,
    bankName,
    branchName,
    id: bankRef.id
  });

  batch.update(employeeRef, {
    bankDetailId: bankRef.id
  });

  await batch.commit();

  return {
    bankDetailId: bankRef.id,
    message: "Bank details added successfully"
  };
};

export const editBankDetails = async (id: string, updateData: Partial<BankDetails>) => {
  const ref = doc(bankDetailsCollection, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("BankDetails info not found");

  await updateDoc(ref, updateData);
  return { message: "BankDetails info updated successfully", updated: updateData };
};

export const getCompleteEmployeeDetailsByCode = async (empCode: string) => {
  const q = query(generalCollection, where("empCode", "==", empCode));
  const generalSnap = await getDocs(q);
  if (generalSnap.empty) throw new Error("No employee found with this employee code");

  const generalDoc = generalSnap.docs[0];
  const generalId = generalDoc.id;

  const employeeQuery = query(employeeCollection, where("generalId", "==", generalId));
  const employeeSnap = await getDocs(employeeQuery);
  if (employeeSnap.empty) throw new Error("Employee record not found");

  const employeeDoc = employeeSnap.docs[0];
  const employeeData = employeeDoc.data();

  const {
    professionalId,
    bankDetailId,
    pfId,
  } = employeeData;

  const [professionalSnap, bankSnap, pfSnap] = await Promise.all([
    professionalId ? getDoc(doc(professionalCollection, professionalId)) : Promise.resolve(null),
    bankDetailId ? getDoc(doc(bankDetailsCollection, bankDetailId)) : Promise.resolve(null),
    pfId ? getDoc(doc(pfCollection, pfId)) : Promise.resolve(null),
    // loanId ? getDoc(doc(loanCollection, loanId)) : Promise.resolve(null),
  ]);

  const loanIds: string[] = employeeData.loanId || [];
  const loanSnaps = await Promise.all(
    loanIds.map(id => getDoc(doc(loanCollection, id)))
  );


  const nullBankDetails = {
    bankName: null,
    accountName: null,
    branchName: null,
    accountNum: null,
    accountType: null,
    ifscCode: null,
  };
  const nullPF = {
    employeePfEnable: false,
    pfNum: null,
    employeerPfEnable: false,
    uanNum: null,
    esiEnable: false,
    esiNum: null,
    professionalTax: false,
    labourWelfare: false
  };




  return {
    general: generalDoc.data(),
    professional: professionalSnap?.exists() ? professionalSnap.data() : null,
    bankDetails: bankSnap?.exists() ? bankSnap.data() : nullBankDetails,
    pf: pfSnap?.exists() ? pfSnap.data() : nullPF,
    loan: loanSnaps.map(snap => snap.exists() ? snap.data() : null),
  };
};

export const createLoanRequest = async (id: string, data: { empName: string; amountReq: string; staffNote: string; note: string; }) => {

  const { empName, amountReq, staffNote, note } = data;
  const employeeRef = doc(employeeCollection, id);
  const employeeSnap = await getDoc(employeeRef);

  if (!employeeSnap.exists()) {
    throw new Error("Employee not found");
  }

  if (!empName || !amountReq) {
    throw new Error('Employee name and requested amount are required');
  }
  const loanRef = doc(loanCollection);
  const reqDate = new Date().toISOString().split('T')[0]
  const loan: Loan = {
    id: loanRef.id,
    empName,
    reqDate: reqDate,
    status: LoanStatus.PENDING,
    amountReq,
    amountApp: '',
    balance: '',
    paybackTerm: {
      installment: '',
      date: '',
      remaining: ''
    },
    approvedBy: '',
    staffNote,
    note,
    activity: [`Loan requested on ${reqDate}`]
  };


  const employeeData = employeeSnap.data();
  const existingLoanIds: string[] = employeeData.loanId || [];

  const batch = writeBatch(db);

  batch.set(loanRef, loan)
  batch.update(employeeRef, {
    loanId: [...existingLoanIds, loanRef.id]
  })

  await batch.commit();

  return {
    message: 'loan created successfully'
  };
};

export const approvedLoan = async (id: string, data: { amountApp: string, installment: string, date: string, staffNote: string }) => {
  const { amountApp, installment, date, staffNote } = data;

  if (!amountApp || !installment || !date || !staffNote) {
    throw new Error("Missing required approval details");
  }

  const loanRef = doc(loanCollection, id);
  const loanSnap = await getDoc(loanRef);

  if (!loanSnap.exists()) {
    throw new Error("Loan record not found");
  }
  const loanData = loanSnap.data();
  const approvedAmount = parseFloat(amountApp);
  const installmentAmount = parseFloat(installment);

  if (isNaN(approvedAmount) || isNaN(installmentAmount) || installmentAmount <= 0) {
    throw new Error("Invalid amount or installment value");
  }

  const newActivityMessage = `Loan approved on ${new Date().toISOString().split('T')[0]}`;
  const updatedActivity = Array.isArray(loanData.activity)
    ? [...loanData.activity, newActivityMessage]
    : [newActivityMessage];
  await updateDoc(loanRef, {
    amountApp,
    balance: amountApp,
    status: LoanStatus.APPROVED,
    'paybackTerm.installment': installment,
    'paybackTerm.date': date,
    'paybackTerm.remaining': amountApp,
    staffNote,
    activity: updatedActivity
  });

  return {
    message: 'Loan approved successfully',
  };
};

export const cancelLoan = async (id: string, cancelReason: string) => {
  const loanRef = doc(loanCollection, id);
  const loanSnap = await getDoc(loanRef);

  if (!loanSnap.exists()) {
    throw new Error('Loan record not found');
  }

  const loanData = loanSnap.data();

  const updatedActivity: string[] = Array.isArray(loanData.activity)
    ? [...loanData.activity, `Loan cancelled ${new Date().toISOString().split('T')[0]}`]
    : [`Loan cancelled ${new Date().toISOString().split('T')[0]}`];

  await updateDoc(loanRef, {
    status: LoanStatus.DECLINED,
    cancelReason,
    activity: updatedActivity
  });

  return {
    message: 'Loan cancelled successfully',
    reason: cancelReason
  };
};

export const editLoan = async (id: string, data: { amountApp?: string, installment?: string, date?: string, staffNote?: string }) => {
  const loanRef = doc(loanCollection, id);
  const snap = await getDoc(loanRef);

  if (!snap.exists()) {
    throw new Error('Loan not found');
  }

  const updates: any = {};

  if (data.amountApp !== undefined) updates['amountApp'] = data.amountApp;
  if (data.staffNote !== undefined) updates['staffNote'] = data.staffNote;
  if (data.installment !== undefined) updates['paybackTerm.installment'] = data.installment;
  if (data.date !== undefined) updates['paybackTerm.date'] = data.date;

  if (Object.keys(updates).length === 0) {
    throw new Error('No valid fields to update');
  }

  await updateDoc(loanRef, updates);

  return { message: "Loan info updated successfully" };
}

export const addPreviousJob = async (empId: string, job: JOB) => {
  const employeeRef = doc(employeeCollection, empId);
  const employeeSnap = await getDoc(employeeRef);

  if (!employeeSnap.exists()) {
    throw new Error('Employee not found');
  }

  const jobRef = doc(previousCollection); // Auto-ID
  const jobWithId = { id: jobRef.id, ...job };
  const employeeData = employeeSnap.data();
  const existingProvIds: string[] = employeeData?.previousJobId || [];

  const batch = writeBatch(db);

  batch.set(jobRef, jobWithId);
  batch.update(employeeRef, {
    previousJobId: [...existingProvIds, jobRef.id],
  });

  await batch.commit();

  return {
    message: 'Previous job added successfully',
    job: jobWithId,
  };
};

export const editPreviousJob = async (jobId: string, updatedData: Partial<JOB>) => {
  const jobRef = doc(previousCollection, jobId);
  const jobSnap = await getDoc(jobRef);

  if (!jobSnap.exists()) {
    throw new Error('Previous job not found');
  }

  await updateDoc(jobRef, updatedData);

  return {
    message: 'Previous job updated successfully',
    updatedFields: updatedData,
    jobId,
  };
};
