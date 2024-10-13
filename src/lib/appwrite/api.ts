import { ID, Query, ImageGravity } from "appwrite";
import { account, appwriteConfig, avatar, db, storage } from "./config";
import {
  INewConversation,
  INewMessage,
  INewPost,
  INewUser,
  IUpdateConversation,
  IUpdatePost,
  IUpdateProfile,
  IUserInDB,
} from "../types";
import { UpdateProfile } from "@/pages";
import { useUserContext } from "@/contexts/AuthContext";

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
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
}

// ============================== GET RECENT POSTS
export async function getRecentPosts() {
  try {
    const posts = db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw new Error("Error while fetching recent posts");

    return posts;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await db.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await db.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await db.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await db.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await db.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await db.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}
// ============================== GET SAVED POSTS
export async function getSavedPosts(userId: string) {
  try {
    const savedPosts = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal("user", userId)]
    );

    if (!savedPosts) throw new Error("Error while fetching saved posts");

    return savedPosts;
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

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

export const updateProfile = async (
  newUserProfileDetails: IUpdateProfile,
  userId: string
) => {
  try {
    const updatedProfile = await db.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        ...newUserProfileDetails,
      }
    );

    if (!UpdateProfile) throw new Error("Error while updating profile details");

    return updatedProfile;
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
  console.log("\n-------------- getCurrentUser() --------------");
  try {
    const currentLoggedInAccount = await account.get();

    console.log("\tCURRENT LOGGEDIN ACCOUNT:", currentLoggedInAccount);

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

    console.log("\tCURRENT USER DOC(s):", currentUserDocs);
    console.log("\tCURRENT USER:", currentUserDocs.documents[0]);

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

// ============================== SIGN OUT USER
export const signOutUser = async (sessionId: string) => {
  console.log("\t------------ signOutUser ---------------");
  try {
    const deletedSession = await account.deleteSession(sessionId);
    return deletedSession;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }

    return undefined;
  }
};

// ============================== FIND USERS BY USERNAMES
export async function findUserByUsername(userName: string) {
  try {
    const posts = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.search("username", userName)]
    );

    if (!posts) throw new Error("Error while finding user by username.");

    return posts;
  } catch (error) {
    console.log(error);
  }
}
export const fetchDummyUsers = async () => {
  try {
    const dummyUser1 = await db.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      "6709680f003a2f1c4f71"
    );
    const dummyUser2 = await db.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      "670968a5003758167283"
    );

    return [dummyUser1, dummyUser2];
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

// ============================================================
// CONVERSATIONS
// ============================================================

// ============================== CREATE CONVESATION DOC
export async function createNewConversation(newConvoDetails: INewConversation) {
  // console.log(">>>>>> createNewConversation()")
  try {
    const newConversationDoc = await db.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      ID.unique(),
      newConvoDetails
    );

    if (!newConversationDoc)
      throw new Error("Errror while creating new conversation doc");

    console.log("\n\t=========== NEW CONVERSATION:", newConversationDoc);
    return newConversationDoc;
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
}

export async function updateConversation(
  convoId: string,
  dataToUpate: IUpdateConversation
) {
  console.log("\n-------------- updateConversation() --------------");
  console.log("\tConversation ID:", convoId);
  console.log("\tData to update:", dataToUpate);

  // for (const [key, value] of Object.entries(dataToUpate)) {
  //   console.log(`Field: ${key}, Value: ${value}, Type: ${typeof value}`);
  // }

  try {
    const updatedConvoDoc = await db.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      convoId,
      dataToUpate
    );

    if (!updatedConvoDoc) throw new Error("Errror while updating conversation");

    return updatedConvoDoc;
  } catch (error) {
    if (error instanceof Error) console.log(error);
  }
}

// ============================== GET RECENT CONVERSATIONS
export async function getRecentConversations(userId: string) {
  const query = [
    Query.equal("participant1", userId),
    Query.equal("participant2", userId),
  ];
  try {
    const conversations = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.conversationsCollectionId,
      [Query.or(query)]
    );

    if (!conversations) throw new Error("Errror while fetching convos");

    return conversations;
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
}

export async function getConversationsMessages(conversationId: string) {
  // console.log(">>>>>> getConversationsMessages()")
  try {
    const messages = await db.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      [
        Query.equal("conversationId", conversationId),
        Query.limit(10),
        Query.orderDesc("createdAt"),
      ]
    );

    if (!messages) throw new Error("Errror while fetching messages");

    // console.log("=========== MESSAGES:",messages)
    return messages;
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
}

// ============================================================
// MESSAGES
// ============================================================

export const sendMessage = async (
  msgData: INewMessage,
  convoDataToUpdate: IUpdateConversation,
  isAnonymous: boolean
) => {
  console.log("\n-------------- sendMessages() --------------");
  try {
    const msgDocId = ID.unique();

    const newMessage = await db.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messagesCollectionId,
      msgDocId, //unique msg ID for each message
      msgData
    );

    if (!newMessage) throw new Error("Errror while fetching messages");


    if (!isAnonymous) {
      const { createdAt, body } = msgData;
      const { conversationId, lastMsgSenderName, lastMsgReceiverName } =
        convoDataToUpdate;

      const updatedConvoDoc = await updateConversation(conversationId!, {
        lastMessageId: msgDocId,
        lastUpdated: createdAt,
        lastMsgIdString: msgDocId,
        lastMsgSenderName,
        lastMsgReceiverName,
        lastMsgBody: body,
      });

      console.log("\n\t=========== UDPATED CONVERSATION:", updatedConvoDoc);
    }
    console.log("\n\t=========== NEW MESSAGE:", newMessage);
    return newMessage;
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
};
