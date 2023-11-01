import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User, { IUser } from "../models/user";

// Controller to create a user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: IUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.SECRET_KEY as string,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({ token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Controller to login a user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user: IUser | null = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to fetch the user document after authentication
export const getUser = async (req: Request, res: Response) => {
  try {
    const authenticatedUser = req.user as IUser;
    if (!authenticatedUser) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(authenticatedUser._id).populate("chats");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
