import React, { useEffect, useState } from "react";
import Display from "./components/Display";
import Keypad from "./components/Keypad";
import Logs from "./components/Logs";
import { safeEvaluate } from "./utils/evaluator";
import { createAppwriteClient } from "./appwrite/client";
import conf from "./conf/conf";
import { ThemeProvider } from "./context/theme";
import ThemeButton from "./components/ThemeButtton";

const App = () => {
  const [expr, setExpr] = useState("");
  const [display, setDisplay] = useState("");
  const [error, setError] = useState("");
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshLogs, setRefreshLogs] = useState(0);

  useEffect(() => {
    const initializeClient = async () => {
      setLoading(true);
      try {
        const appwriteClient = await createAppwriteClient();
        setClient(appwriteClient);
      } catch (err) {
        console.error("Failed to initialize Appwrite:", err);
        setClient(null);
      } finally {
        setLoading(false);
      }
    };

    initializeClient();
  }, []);

  const appwriteConfig = {
    databaseId: conf.appwriteDatabaseId || "",
    collectionId: conf.appwriteCollectionId || "",
  };

  const saveLog = async (operation, result) => {
    if (!client || !appwriteConfig.databaseId || !appwriteConfig.collectionId) {
      return;
    }
    try {
      await client.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.collectionId,
        null,
        {
          operation,
          result: String(result),
          timestamp: Math.floor(Date.now() / 1000),
        }
      );

      setRefreshLogs(prev=> prev + 1);
    } catch (error) {
      console.warn("Save log failed", error);
    }
  };

  const handleInput = (char) => {
    setError("");
    const last = expr[expr.length - 1];
    const isOp = /[+\-*/.]/.test(char);

    if (isOp) {
      if (!expr && char !== "-") return;
      if (/[+\-*/.]/.test(last) && char !== "(" && char !== ")") {
        if (char === "-" && /[+\-*/]/.test(last)) {
          // allow unary minus after operator
        } else {
          setExpr((s) => s.slice(0, -1) + char);
          setDisplay((s) => s.slice(0, -1) + char);
          return;
        }
      }
    }
    setExpr((s) => s + char);
    setDisplay((s) => s + char);
  };

  const handleClear = () => {
    setExpr("");
    setDisplay("");
    setError("");
  };

  const handleDelete = () => {
    setExpr((s) => s.slice(0, -1));
    setDisplay((s) => s.slice(0, -1));
    setError("");
  };

  function handleEquals() {
    try {
      if (!expr) return;
      const result = safeEvaluate(expr);
      setDisplay(String(result));
      saveLog(expr, result);
      setExpr(String(result));
      setError("");
      
    } catch (err) {
      setError(err.message || String(err));
    }
  }


  const [themeMode, setThemeMode] = useState("light");
  const darkTheme = () => {
    setThemeMode("dark");
  };
  const lightTheme = () => {
    setThemeMode("light");
  };

  //theme change
  useEffect(() => {
    const doc = document.querySelector("html").classList;
    doc.remove("dark", "light");
    doc.add(themeMode);

    // console.log("theme",themeMode)
  }, [themeMode]);


  return (
    <ThemeProvider value={{themeMode,darkTheme,lightTheme}}>
      <div className="min-h-screen p-6 bg-white text-gray-900 dark:bg-gray-900  dark:text-gray-100">
        <div className="max-w-3xl mx-auto">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">React Calculator</h1>
            <ThemeButton />
          </header>

          <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <Display value={display} error={error} />

              <div className="mt-4">
                <Keypad
                  onInput={handleInput}
                  onClear={handleClear}
                  onDelete={handleDelete}
                  onEquals={handleEquals}
                />
              </div>
            </section>

            <aside>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded">
                <h2 className="text-lg font-semibold">Logs</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Database status: {client ? "Configured" : "Not configured"}
                </p>
                <div className="mt-3">
                  <Logs
                    client={client}
                    databaseId={appwriteConfig.databaseId}
                    collectionId={appwriteConfig.collectionId}
                    refreshTrigger={refreshLogs}
                  />
                </div>
              </div>
            </aside>
          </main>

          <footer className="mt-6 text-sm text-gray-500">
            <div>Notes:</div>
            <ul className="list-disc ml-6">
              <li>Supports + - * / and parentheses and decimals.</li>
              <li>
                Input validation prevents some invalid operator sequences.
              </li>
              <li>
                Logs are optionally saved to Appwrite if environment is
                configured.
              </li>
            </ul>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
