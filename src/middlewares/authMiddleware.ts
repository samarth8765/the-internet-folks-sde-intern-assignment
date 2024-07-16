import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { JWTPayload } from "../utils/schema";
import { DBClient } from "../utils/prisma";

const db = DBClient.getInstance();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    } else {
      return res.status(401).json({
        status: false,
        error: "Not authorized",
      });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: false,
        error: "Invalid credentials",
      });
    }

    //@ts-ignore
    req.data = { user, token };
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Internal Server Error" });
  }
};