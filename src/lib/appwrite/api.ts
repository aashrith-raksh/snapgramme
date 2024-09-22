import { ID } from "appwrite";
import { account } from "./config";
import { INewUser } from "../types";

export const createUser = async (userDetails: INewUser) => {
  try {
    const { email, password, name } = userDetails;
    const newAccount = await account.create(ID.unique(), email, password, name);

    return (newAccount);
  } catch (error) {
    if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("An unknown error occurred.");
      }
  }
};
