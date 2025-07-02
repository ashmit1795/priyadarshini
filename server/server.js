import connectDB from "./db/db.js";
import { app } from "./app.js";
import { PORT } from "./config/env.js";

connectDB().then(() => {
    app.on("error", (error) => {
        console.log(`Error: ${error.message}`);
    });

    app.listen(PORT, () => {
        console.log(`Priyadarshini server in running on http://localhost:${PORT}`);
    })
}).catch((error) => {
    console.log(`Error: ${error.message}`);
});

// Export the app for Vercel
export default app;