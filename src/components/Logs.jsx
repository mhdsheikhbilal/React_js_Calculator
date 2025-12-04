import React, { useEffect, useState } from "react";

const Logs = ({ client, databaseId, collectionId, refreshTrigger }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const fetchLogs = async () => {
    // Check if client is available
    if (!client) {
      console.log("Appwrite client not available. Please check connection.");
      return;
    }

    if (!databaseId || !collectionId) {
      console.log("Database or Collection ID not configured.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Try different approaches for queries parameter
      let res;
      // Approach 1: Try with undefined
      try {
        res = await client.listDocuments(databaseId, collectionId);
      } catch (err1) {
        console.log("Approach 1 failed, trying empty array...");
        console.log(client, databaseId, collectionId);
        // Approach 2: Try with empty array
        res = await client.listDocuments(databaseId, collectionId);
      }
      console.log("Fetched logs:", res);

      setLogs(res.rows || []);
    } catch (error) {
      console.error("Fetch logs error:", error);

      // Provide more specific error message
      if (error.message.includes("Invalid `queries` param")) {
        setError(
          "Configuration error: Invalid query format. Please check Appwrite setup."
        );
      } else if (
        error.message.includes("401") ||
        error.message.includes("Unauthorized")
      ) {
        setError("Authentication failed. Please check user credentials.");
      } else if (
        error.message.includes("404") ||
        error.message.includes("not found")
      ) {
        setError("Database or Collection not found. Please check IDs.");
      } else {
        setError("Failed to fetch logs: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (client && databaseId && collectionId) {
      fetchLogs();
    }
  }, [client, databaseId, collectionId, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!client) {
      alert("Appwrite client not available");
      return;
    }

    try {
      await client.deleteDocument(databaseId, collectionId, id);
      setLogs((prev) => prev.filter((log) => log.$id !== id));
    } catch (error) {
      alert("Delete Failed: " + (error.message || error));
    }
  };

  const handleDeleteAll = async () => {
    if (!client) {
      alert("Appwrite client not available");
      return;
    }

    if (!window.confirm("Delete all logs?")) return;

    try {
      const promises = logs.map((log) =>
        client.deleteDocument(databaseId, collectionId, log.$id)
      );
      await Promise.all(promises);
      setLogs([]);
    } catch (error) {
      alert("Delete all failed: " + (error.message || error));
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div className="mt-4 ">
      <div className="flex justify-between items-center mb-2 ">
        <h3 className="text-lg font-semibold">Operation Logs</h3>
        {error && (
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Retry
          </button>
        )}
      </div>

      {loading && (
        <div className="text-blue-500 animate-pulse">Loading logs...</div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <div className="text-red-600 dark:text-red-400 font-medium">
            Error
          </div>
          <div className="text-red-500 text-sm mt-1">{error}</div>
          <div className="text-xs text-gray-500 mt-2">
            Check: 1) User exists in Appwrite 2) Collection permissions 3)
            Network connection
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            className="space-y-2 max-h-64 overflow-auto mt-3"
          >
            {console.log("Logs:", logs)}
            {logs.length === 0 ? (
              <div className="text-center p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded">
                <div className="text-gray-500">No logs yet</div>
                <div className="text-xs text-gray-400 mt-1">
                  Perform calculations to see logs here
                </div>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.$id}
                  className="flex justify-between items-center p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-mono text-sm truncate"
                      title={log.operation}
                    >
                      {log.operation}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      = {log.result}
                      {/* •{" "}
                      {new Date((log.timestamp || 0) * 1000).toLocaleString()} */}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() =>
                        navigator.clipboard?.writeText(
                          `${log.operation} = ${log.result}`
                        )
                      }
                      className="px-2 py-1 bg-green-500 hover:bg-green-600 rounded text-white text-xs transition-colors"
                      title="Copy to clipboard"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDelete(log.$id)}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-xs transition-colors"
                      title="Delete this log"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {logs.length > 0 && (
            <div className="mt-3 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {logs.length} log{logs.length !== 1 ? "s" : ""} found
              </div>
              <button
                onClick={handleDeleteAll}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                Delete All
              </button>
            </div>
          )}
        </>
      )}

      {!client && !loading && !error && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
          <div className="text-yellow-700 dark:text-yellow-300 font-medium">
            Appwrite Not Connected
          </div>
          <div className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
            Please check your configuration and restart the app
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;
