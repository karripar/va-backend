import app from "./app";
import mangustiConnection from "./utils/db";
import { seedApplicationStages } from "./utils/seedApplicationStages";

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await mangustiConnection();
    await seedApplicationStages();
    app.listen(PORT, () => {
      console.log(`Auth server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();

