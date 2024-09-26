import { ID, Query } from "appwrite";
import { account, appwriteConfig, avatar, db } from "./config";
import { INewUser, IUserInDB } from "../types";

export const createUserAccount = async (userDetails: INewUser) => {
  try {
    const { email, password, name } = userDetails;
    const newAccount = await account.create(ID.unique(), email, password, name);

    if (!newAccount) throw new Error("Failed to create user account");

    const avatarUrl = await avatar.getInitials(newAccount.name);

    const newUserDetails = {
      accountId: newAccount.$id,
      email: newAccount.email,
      name: newAccount.name,
      imageUrl: avatarUrl,
      username: userDetails.username,
    };

    const newUserInDB = saveUserToDB(newUserDetails);

    return newUserInDB;
  } catch (error) {
    if (error instanceof Error) {
      console.log("------ createUserAccount -------------");
      console.error("\t" + error.message);
    } else {
      console.log("------ createUserAccount -------------");
      console.error("\t" + "An unknown error occurred.");
    }
  }
};

export const saveUserToDB = async (newUserDetails: IUserInDB) => {
  try {
    const newUserInDB = await db.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(), //--note: this references documentId. accoundId is seperate and different for each document.
      newUserDetails
    );

    return newUserInDB;
  } catch (error) {
    if (error instanceof Error) {
      console.log("------ saveUserToDB -------------");
      console.error("\t" + error.message);
    } else {
      console.log("------ createUserAccount -------------");
      console.error("\t" + "An unknown error occurred.");
    }
  }
};

export const signInUser = async (userCredentials: {
  email: string;
  password: string;
}) => {
  try {
    const { email, password } = userCredentials;
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.log("------- signInUser --------");

    if (error instanceof Error) {
      console.error("\t", error.message);
    } else {
      console.error("\tUnkniown error occured");
    }
  }
};

export const getCurrentUser = async () => {
  try {
    const currentLoggedInAccount = await account.get();
    if (!currentLoggedInAccount)
      throw new Error("currentLoggedInAcccount not found");


    const currentId = currentLoggedInAccount.$id;

    const currentUserDocs = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentId)]
    );

    if (!currentUserDocs) {
      throw new Error("currentUserDoc not found");
    }

    return currentUserDocs.documents[0];
  } catch (error) {
    if (error instanceof Error) {
      console.log("----- getCurretUser -------");
      console.error("\t", error.message);
    }
  }
};

//use this to debug. This version has console logs of the results
export const getCurrentUserWithLogs = async () => {
  console.log("------- getCurrentUser --------");
  try {
    const currentLoggedInAccount = await account.get();
    if (!currentLoggedInAccount)
      throw new Error("currentLoggedInAcccount not found");

    console.log("\tcurrentLoggedInAccount:", currentLoggedInAccount);

    const currentId = currentLoggedInAccount.$id;
    console.log("\tcurrentId:", currentId);

    const currentUserDocs = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentId)]
    );

    if (!currentUserDocs) {
      throw new Error("currentUserDoc not found");
    }

    console.log("\n\tcurrentUserDocs[0]:", currentUserDocs.documents[0]);
    console.log("\tRETURNING....", currentUserDocs.documents[0]);
    console.log("-------------------------------------------------");

    return currentUserDocs.documents[0];
  } catch (error) {
    if (error instanceof Error) {
      console.log("----- getCurretUser -------");
      console.error("\t", error.message);
    }
  }
};

export const signOutUser = async () => {
  console.log("\t------------ signOutUser ---------------")
  try {
    const deletedSession = await account.deleteSession("current");
    console.log("\tdeletedSession", deletedSession);
    return deletedSession;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }

    return undefined;
  }
};
