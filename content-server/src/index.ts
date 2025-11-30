import app from "./app";
import mangustiConnection from "./utils/db";
import { initializeDatabase } from "./utils/initDatabase";

const PORT = process.env.PORT || 3002;

(async () => {
  try {
    await mangustiConnection();
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Content server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();
