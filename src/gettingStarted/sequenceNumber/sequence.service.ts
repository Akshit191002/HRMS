import admin from "../../firebase";
import { SequenceNumber } from "./sequence.model";

const db = admin.firestore();
const collection = db.collection("sequenceNumbers");

export const createSequence = async (data: SequenceNumber): Promise<string> => {
  const docRef = await collection.add(data);
  return docRef.id;
};

export const getAllSequences = async (): Promise<SequenceNumber[]> => {
  const snapshot = await collection.get();
  if (snapshot.empty) return [];

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as SequenceNumber),
  }));
};

export const increaseSequence = async (type: string) => {
  const snapshot = await collection.where("type", "==", type).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  const docRef = snapshot.docs[0].ref;
  const currentData = snapshot.docs[0].data() as SequenceNumber;

  const updatedData = {
    ...currentData,
    nextAvailableNumber: (currentData.nextAvailableNumber || 0) + 1,
  };

  await docRef.update({ nextAvailableNumber: updatedData.nextAvailableNumber });

  return updatedData;
};
