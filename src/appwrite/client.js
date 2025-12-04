// src/appwrite/client.js
import { Client, Databases, Account, ID, TablesDB,Query } from "appwrite";
import conf from "../conf/conf";

export const createAppwriteClient = async () => {
  try {
    // 1. Create client
    const client = new Client()
      .setEndpoint(conf.appwriteEndpoint)
      .setProject(conf.appwriteProjectId);

    // 2. Setup authentication
    const account = new Account(client);
    const session = await account.getSession("current");
    console.log("Session", session)
    // 3. Try to login
    try {

      if (!session) {
        await account.createEmailPasswordSession(
          conf.appwriteEmail,
          conf.appwritePassword
        );
      }
      console.log("✅ Login successful");
    } catch (authError) {
      console.warn("⚠️ Login failed:", authError.message);
      // Don't throw, continue without authentication
    }

    // 4. Create databases instance
    const databases = new Databases(client);
    const tablesDB = new TablesDB(client);

    // 5. Return client methods
    return {
      createDocument: async (databaseId, collectionId, documentId, data) => {
        return await tablesDB.createRow(
          databaseId,
          collectionId,
          documentId || ID.unique(),
          data
        );
      },

      listDocuments: async (databaseId, collectionId) => {
        return await tablesDB.listRows(
          {
            databaseId: databaseId,
            tableId: collectionId,
            queries: [Query.orderDesc("$id")
],
          }
        );
      },

      deleteDocument: async (databaseId, collectionId, docId) => {
        return await tablesDB.deleteRow(
          databaseId,
          collectionId,
          docId
        );
      },
    };
  } catch (error) {
    console.error("❌ Failed to create Appwrite client:", error);
    return null;
  }
}