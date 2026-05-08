import { connectDatabase } from "./src/config/connectDatabase";
import { settings, validateRuntimeSettings } from "./src/config/settings";

async function startServer(): Promise<void> {
  try {
    validateRuntimeSettings();
    await connectDatabase();
    const { app } = await import("./src/app");

    app.listen(settings.PORT, () => {
      console.log(`Server läuft auf Port ${settings.PORT}`);
    });
  } catch (error) {
    console.error("Serverstart fehlgeschlagen", error);
    process.exit(1);
  }
}

void startServer();
