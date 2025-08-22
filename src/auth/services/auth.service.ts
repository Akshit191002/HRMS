import { getFirestore } from "firebase-admin/firestore";
import { UserRole } from "../constants/roles";
import admin from "../../firebase";
import logger from "../../utils/logger";
import axios from "axios";

const db = getFirestore();

export const createUserWithRole = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  isLoginEnabled: boolean,
  isAccountLocked: boolean
) => {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName,
      role,
      isLoginEnabled,
      isAccountLocked,
      createdAt: new Date().toISOString(),
    });
    logger.info(`User created with role: ${role} | UID: ${userRecord.uid}`);
    return userRecord;
  } catch (error: any) {
    logger.error(`Failed to create user with role ${role}: ${error.message}`);
    throw error;
  }
};

export const checkSuperAdminExists = async (): Promise<boolean> => {
  try {
    const snapshot = await db
      .collection("users")
      .where("role", "==", UserRole.SUPER_ADMIN)
      .limit(1)
      .get();

    const exists = !snapshot.empty;
    logger.info(`Super Admin exists: ${exists}`);
    return exists;
  } catch (error: any) {
    logger.error(`Error checking Super Admin existence: ${error.message}`);
    throw error;
  }
};

export const getUserDataByUid = async (
  uid: string
): Promise<{
  role: UserRole;
  isLoginEnabled: boolean;
  isAccountLocked: boolean;
} | null> => {
  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      logger.warn(`User with UID ${uid} not found`);
      return null;
    }

    const data = userDoc.data();
    logger.info(`User fetched for UID ${uid} | Role: ${data?.role}`);
    return {
      role: data?.role,
      isLoginEnabled: data?.isLoginEnabled,
      isAccountLocked: data?.isLoginEnabled,
    };
  } catch (error: any) {
    logger.error(`Error fetching user ${uid}: ${error.message}`);
    throw error;
  }
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const apiKey = process.env.FIREBASE_API_KEY;
    const response = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${apiKey}`,
      {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }
    );

    logger.info(`Access token refreshed for refreshToken`);
    return {
      accessToken: response.data.id_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
    };
  } catch (error: any) {
    logger.error(`Failed to refresh token: ${error.message}`);
    throw error;
  }
};

export const logoutUser = async (token: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    await admin.auth().revokeRefreshTokens(decodedToken.uid);
    logger.info(`Logout successful | UID: ${decodedToken.uid}`);
    return "Logout successful. Token revoked.";
  } catch (error: any) {
    logger.error(`Logout failed: ${error.message}`);
    throw error;
  }
};
