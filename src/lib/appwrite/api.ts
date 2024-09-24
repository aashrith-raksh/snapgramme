import { ID } from "appwrite";
import { account, appwriteConfig, avatar, db } from "./config";
import { INewUser } from "../types";

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
      console.log("------ createUserAccount -------------")
      console.error('\t' + error.message);
    } else {
      console.log("------ createUserAccount -------------")
      console.error('\t' + "An unknown error occurred.");
    }
  }
};

export const saveUserToDB = async (newUserDetails: any) => {
  try {
    const newUserInDB = await db.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      newUserDetails
    );

    return newUserInDB
  } catch (error) {
    if (error instanceof Error) {
      console.log("------ saveUserToDB -------------")
      console.error('\t' + error.message);
    } else {
      console.log("------ createUserAccount -------------")
      console.error('\t' + "An unknown error occurred.");
    }
  }
};
