import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";


export const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
