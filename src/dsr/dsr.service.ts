import { firestore } from "firebase-admin";
import { DSR } from "./dsr.model";

const db = firestore();
const dsrCollection = db.collection("dsr");

export const createDSR = async (data: DSR) => {
  const now = Date.now();
  const docRef = await dsrCollection.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return { id: docRef.id };
};

export const getDSRList = async (filters?: {
  empId?: string;
  date?: string;
  projects?: string;
  submissionStatus?: string;
  myApprovalStatus?: string;
}): Promise<DSR[] | DSR | null> => {
  let query: FirebaseFirestore.Query = dsrCollection;

  if (filters?.empId) {
    query = query.where("empId", "==", filters.empId);
  }

  if (filters?.date) {
    query = query.where("date", "==", filters.date);
  }

  if (filters?.projects) {
    query = query.where("projects", "==", filters.projects);
  }

  if (filters?.submissionStatus) {
    query = query.where("submissionStatus", "==", filters.submissionStatus);
  }

  if (filters?.myApprovalStatus) {
    query = query.where("myApprovalStatus", "==", filters.myApprovalStatus);
  }

  const snapshot = await query.get();
  const dsrs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DSR[];

  dsrs.sort((a, b) => {
    if (b.date === a.date) {
      return b.createdAt - a.createdAt;
    }
    return b.date - a.date;
  });

  return dsrs;
};

export const updateDSRById = async (id: string, data: Partial<DSR>) => {
  await dsrCollection.doc(id).update({
    ...data,
    updatedAt: Date.now(),
  });

  return { id };
};

// export const deleteDSRById = async (id: string) => {
//   await dsrCollection.doc(id).delete();
//   return { id };
// };
