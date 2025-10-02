import app from "./app";
import mangustiConnection from "./utils/db";

const PORT = process.env.PORT || 3002;

(async () => {
  try {
    await mangustiConnection();
    app.listen(PORT, () => {
      console.log(`Content server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();
