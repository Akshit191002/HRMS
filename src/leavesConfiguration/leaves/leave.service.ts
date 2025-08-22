import admin from "../../firebase";
import { LeaveConfiguration } from "./leave.model";

const db = admin.firestore();
const collection = db.collection("leaves");

export const createLeave = async (data: LeaveConfiguration) => {
  const docRef = await collection.add({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return { id: docRef.id };
};

export const getAllLeave = async () => {
  const snapshot = await collection.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateLeave = async (
  id: string,
  data: Partial<LeaveConfiguration>
) => {
  const docRef = collection.doc(id);
  await docRef.update({
    ...data,
    updatedAt: new Date(),
  });
  return { id };
};

export const deleteLeave = async (id: string) => {
  await collection.doc(id).delete();
  return { id };
};
