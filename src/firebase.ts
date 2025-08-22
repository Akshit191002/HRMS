import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
   storageBucket: "hrms-293ab.firebasestorage.app"
});

export default admin;
