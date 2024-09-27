import { ID, Query, ImageGravity } from "appwrite";
import { account, appwriteConfig, avatar, db, storage } from "./config";
import { INewPost, INewUser, IUserInDB } from "../types";

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
  console.log("\t------------ signOutUser ---------------");
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

export async function createPost(post: INewPost) {
  try {
    // Upload file/post image to appwrite storage
    //uploadedFile ---> image file stored in storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile)
      throw new Error("Error while uploading/saving post media to storage");

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw new Error("Error in creaing fileUrl for file preview");
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await db.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw new Error(
        "Error while creating doc for new post in DB\nDeleting correspondign media from storage"
      );
    }

    return newPost; //references the doc created for new post in Posts collection
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    return undefined;
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Top,
      100
    );

    if (!fileUrl) throw new Error("Error in creating file preview");

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}
