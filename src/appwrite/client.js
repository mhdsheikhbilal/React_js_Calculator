// src/appwrite/client.js
import { Client, Databases, Account, ID, TablesDB, Query } from "appwrite";
import conf from "../conf/conf";

export const createAppwriteClient = async () => {
  try {
    // 1. Create client
    const client = new Client()
      .setEndpoint(conf.appwriteEndpoint)
      .setProject(conf.appwriteProjectId);

    // 2. Initialize services
    const account = new Account(client);
    const tablesDB = new TablesDB(client);

    // 3. Try to login if credentials are provided
    if (conf.appwriteEmail && conf.appwritePassword) {
      try {
        // Check if we have an existing session
        let session;
        try {
          session = await account.getSession("current");
        } catch (error) {
          // No current session exists, this is expected
        }

        // If we have a session, delete it first (optional cleanup)
        if (session) {
          try {
            await account.deleteSession(session.$id);
          } catch (error) {
            // Ignore delete errors
          }
        }

        // Create new session with provided credentials
        await account.createEmailPasswordSession(
          conf.appwriteEmail,
          conf.appwritePassword
        );
        
      } catch (authError) {
        console.warn("⚠️ Login failed:", authError.message);
        // Don't throw, continue without authentication if login fails
      }
    } else {
      console.warn("⚠️ No credentials provided, continuing without authentication");
    }

    // 4. Return client methods with proper error handling
    return {
      createDocument: async (databaseId, collectionId, documentId, data) => {
        try {
          return await tablesDB.createRow(
            databaseId,
            collectionId,
            documentId || ID.unique(),
            data
          );
        } catch (error) {
          console.error("Error creating document:", error);
          throw error;
        }
      },

      listDocuments: async (databaseId, collectionId) => {
        try {
          return await tablesDB.listRows({
            databaseId: databaseId,
            tableId: collectionId,
            queries: [Query.orderDesc("$id")],
          });
        } catch (error) {
          console.error("Error listing documents:", error);
          throw error;
        }
      },

      deleteDocument: async (databaseId, collectionId, docId) => {
        try {
          return await tablesDB.deleteRow(
            databaseId,
            collectionId,
            docId
          );
        } catch (error) {
          console.error("Error deleting document:", error);
          throw error;
        }
      },
    };
  } catch (error) {
    console.error("❌ Failed to create Appwrite client:", error);
    return null;
  }
};