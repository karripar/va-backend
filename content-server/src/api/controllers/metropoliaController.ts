import { Request, Response, NextFunction } from "express";
import { MessageResponse } from "../../types/MessageTypes";
import CustomError from "../../classes/CustomError";
import fetchData from "../../utils/fetchData";
import dotenv from "dotenv";
dotenv.config();


const METROPOLIA_API_KEY = process.env.OPENDATA_KEY || "";

if (!METROPOLIA_API_KEY) {
  throw new Error("Metropolia API key not set in environment variables");
};

const createAuthHeader = (apiKey: string) => {
  return `Basic ${Buffer.from(apiKey + ":").toString("base64")}`;
};

const getFromMetropolia = async (path: string, acceptLanguage?: string) => {
  const url = `https://api.opendata.metropolia.fi${path}`;
  const headers: HeadersInit = {
    "Authorization": createAuthHeader(METROPOLIA_API_KEY),
  };

  if (acceptLanguage) {
    headers["Accept-Language"] = acceptLanguage;
  }

  const options: RequestInit = {
    method: "GET",
    headers,
  };

  return await fetchData(url, options);
};


const postToMetropolia = async (
  path: string,
  body: object,
  acceptLanguage?: string
) => {
  const url = `https://api.opendata.metropolia.fi${path}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Authorization": createAuthHeader(METROPOLIA_API_KEY),
  };

  if (acceptLanguage) {
    headers["Accept-Language"] = acceptLanguage;
  }

  const options: RequestInit = {
    method: "GET",
    headers,
    body: JSON.stringify(body),
  };

  return await fetchData(url, options);
}

const postMetropoliaData = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const { path, body } = req.body;
    const acceptLanguage = req.headers["accept-language"] as string | undefined;

    if (!path || !body) {
      throw new CustomError("Missing 'path' or 'body' in request", 400);
    }

    const data = await postToMetropolia(path, body, acceptLanguage);

    res.json({
      message: "Data fetched successfully from Metropolia API",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getMetropoliaData = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    const { path } = req.query; // use query param for GET
    const acceptLanguage = req.headers["accept-language"] as string | undefined;

    if (!path || typeof path !== "string") {
      throw new CustomError("Missing 'path' query parameter", 400);
    }

    const data = await getFromMetropolia(path, acceptLanguage);

    res.json({
      message: "Data fetched successfully from Metropolia API",
      data,
    });
  } catch (error) {
    next(error);
  }
};


export { postMetropoliaData, getMetropoliaData };
