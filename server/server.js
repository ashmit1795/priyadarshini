import connectDB from "./db/db.js";
import { app } from "./app.js";
import debug from "debug";
import { PORT } from "./config/env.js";

const serverDebug = debug("server:entry");

connectDB().then(() => {
    app.on("error", (error) => {
        serverDebug(`Error: ${error.message}`);
    });

    app.listen(PORT, () => {
        serverDebug(`Priyadarshini server in running on http://localhost:${PORT}`);
    })
}).catch((error) => {
    serverDebug(`Error: ${error.message}`);
});

// Export the app for Vercel
export default app;