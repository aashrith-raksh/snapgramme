import {Client, Avatars, Databases, Account, Storage} from "appwrite"

export const appwriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    url: import.meta.env.VITE_APPWRITE_URL,

}

export const client = new Client();

client.setProject(appwriteConfig.projectId);
client.setEndpoint(appwriteConfig.url);

export const account = new Account(client);
export const db = new Databases(client);
export const avatar = new Avatars(client);
export const storage = new Storage(client);