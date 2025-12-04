const conf={
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteEndpoint: String(import.meta.env.VITE_APPWRITE_ENDPOINT),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID),
    appwriteApiKey: String(import.meta.env.VITE_APPWRITE_API_KEY),
    appwriteEmail: "testing1234@gmail.com",
    appwritePassword: "testing1234"
}

export default conf;