import { Request, Response } from "express";
import Chat from "../models/chat";
import { IUser } from "../models/user";

export const addMessageToChat = async (req: Request, res: Response) => {
  try {
    const { chatId, text, sender, tnd } = req.body;
    const user = req.user as IUser;

    const chat = await Chat.findById(chatId).populate({
      path: "message",
      select: "messages",
    });

    if (!chat || !chat.users.includes(user._id)) {
      return res
        .status(401)
        .json({ message: "Not authorized or Chat not found" });
    }

    chat.message.messages.push({ text, sender, tnd });

    await chat.message.save();

    res.status(201).json({ message: "Message added successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

exports = {};
