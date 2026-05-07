import { app } from "./src/app";

import { connectDatabase } from "./src/config/connectDatabase";
import { settings } from "./src/config/settings";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(settings.PORT, () => {
      console.log(`Server läuft auf Port ${settings.PORT}`);
    });
  } catch (error) {
    console.error("Serverstart fehlgeschlagen", error);
    process.exit(1);
  }
}

void startServer();
