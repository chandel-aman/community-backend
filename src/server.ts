import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import { passportConfig } from "./config/passport-config";

// Routes
import routes from "./routes/combinedRoutes";

// Services
import { connectToDatabase } from "./services/databaseService";
import { verifyApiKey } from "./middlewares/apiKeyVerifier";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5000,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

const allowedOrigins: string[] = ["*"];

app.use(apiLimiter);

if (process.env.NODE_ENV === "production") {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
        },
      },
    })
  );
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(bodyParser.json());

app.use(passportConfig.initialize);

app.get("/", (req, res) => {
  res.send(
    `<h1 style="width: 100%; text-align: center;">Hey! Server is running!</h1>`
  );
});

// Apply API Key verification to all routes under '/api'
app.use("/api", verifyApiKey, routes);

connectToDatabase();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
