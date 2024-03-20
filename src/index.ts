import { app } from "./config/app";
import { connectDb } from "./config/db";
import { ErrorMiddleware } from "./middleware/error";

// app api routes

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDb();
});

app.use(ErrorMiddleware);
