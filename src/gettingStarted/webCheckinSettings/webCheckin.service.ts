import admin from "../../firebase";
import { WebCheckinSettings } from "./webCheckin.model";

const db = admin.firestore();
const collection = db.collection("webCheckinSettings");

export const getWebCheckinSettings =
  async (): Promise<WebCheckinSettings | null> => {
    const snapshot = await collection.limit(1).get();
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...(doc.data() as WebCheckinSettings) };
  };

export const putWebCheckinSettings = async (
  data: Omit<WebCheckinSettings, "id" | "updatedAt">
): Promise<string> => {
  const snapshot = await collection.limit(1).get();

  const payload = {
    ...data,
    updatedAt: Date.now(),
  };

  if (snapshot.empty) {
    const docRef = await collection.add(payload);
    return docRef.id;
  } else {
    const docRef = snapshot.docs[0].ref;
    await docRef.update(payload);
    return snapshot.docs[0].id;
  }
};
