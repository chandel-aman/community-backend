import { startSession } from "mongoose";
import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import { Community } from "../models/community";
import Chat, { IChat } from "../models/chat";
import Message, { IMessage } from "../models/message";

// Controller function to create a chat
export const createChat = async (req: Request, res: Response) => {
  const session = await startSession();
  session.startTransaction();
  try {
    const { community, users, title } = req.body;
    const user = req.user as IUser;

    const isAdmin = await Community.findOne({
      _id: community,
      admins: user._id,
    });

    if (!isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "User is not an admin of this community or no community found",
      });
    }

    const chatExists = await Chat.findOne({
      community,
      title,
    });

    if (chatExists) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Chat with the same title already exists" });
    }

    const distinctUsers: IUser["_id"][] = Array.from(new Set(users)); // Remove duplicate users

    if (distinctUsers.length !== users.length) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: "Duplicate users are not allowed in the chat" });
    }

    const message = await new Message({
      message: [],
      unseenMessages: { count: 0 },
    }).save({ session });

    const newChat = new Chat({
      community,
      users: distinctUsers,
      creationDate: new Date(),
      creator: user._id,
      message: message._id,
      title,
    });

    newChat.save({ session });

    // Update the 'chats' array of users who are part of the chat
    await User.updateMany(
      { _id: { $in: distinctUsers } },
      { $addToSet: { chats: newChat._id } },
      { session }
    );

    // Add the chat ID to the community's 'chats' array
    await Community.updateOne(
      { _id: community },
      { $addToSet: { chats: newChat._id } },
      { session }
    );

    await session.commitTransaction();

    res
      .status(201)
      .json({ message: "Chat created successfully", chat: newChat });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  }
};

// Controller function to delete a chat
export const deleteChat = async (req: Request, res: Response) => {
  const session = await startSession();
  session.startTransaction();
  try {
    const chatId = req.params.chatId;
    const user = req.user as IUser;

    const chat = await Chat.findById(chatId).populate("community users");

    if (!chat) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Chat not found" });
    }

    const isAdmin = chat.community.admins.some(
      (admin: IUser["_id"]) => admin.toString() === user._id.toString()
    );

    if (!isAdmin && chat.creator.toString() !== user._id.toString()) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "Your are not authorised to delete this" });
    }

    await Promise.all([
      // Remove the chat ID from the community's 'chats' array
      Community.updateOne(
        { _id: chat.community._id },
        { $pull: { chats: chatId } },
        { session }
      ),
      // Remove the chat ID from the 'chats' array of all users in the chat
      User.updateMany(
        { _id: { $in: chat.users.map((u: IUser["_id"]) => u._id) } },
        { $pull: { chats: chatId } },
        { session }
      ),
      // Delete the message document for this chat
      Message.findByIdAndDelete(chat.message, { session }),
      // Delete the chat
      Chat.findByIdAndDelete(chatId, { session }),
    ]);

    await session.commitTransaction();

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

// Controller to add users to chat
export const addUsersToChat = async (req: Request, res: Response) => {
  const session = await startSession();
  session.startTransaction();

  try {
    const { chatId, users } = req.body;
    const user = req.user as IUser;

    const chat = await Chat.findById(chatId).populate("community");

    if (!chat) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Chat not found" });
    }

    const isAdmin = chat.community.admins.includes(user._id);

    if (!isAdmin) {
      await session.abortTransaction();
      return res
        .status(403)
        .json({ message: "User is not an admin of this community" });
    }

    // Check for duplicate users
    const existingUsers = chat.users.map((u: any) => u.toString());
    const uniqueNewUsers = users.filter((u: any) => !existingUsers.includes(u));

    if (uniqueNewUsers.length !== users.length) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Duplicate users are not allowed in the chat" });
    }

    await User.updateMany(
      { _id: { $in: uniqueNewUsers } },
      { $addToSet: { chats: chatId } },
      { session }
    );

    chat.users.push(...uniqueNewUsers);
    await chat.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: "Participants added to the chat" });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Controller to remove users from a chat
export const removeUsersFromChat = async (req: Request, res: Response) => {
  const session = await startSession();
  session.startTransaction();
  try {
    const { chatId, users } = req.body;
    const user = req.user as IUser;

    const chat = await Chat.findById(chatId).populate("community");

    if (!chat) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Chat not found" });
    }

    const isAdmin = chat.community.admins.includes(user._id);

    if (!isAdmin) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "Only admins can remove a user",
      });
    }

    // Check if admin is trying to remove themselves
    if (users.includes(user._id.toString())) {
      // Admin leaving the chat
      chat.users = chat.users.filter(
        (u) => u.toString() !== user._id.toString()
      );
    } else if (users.some((id: any) => chat.community.admins.includes(id))) {
      await session.abortTransaction();
      return res.status(403).json({
        message: "You can not remove an admin",
      });
    } else {
      chat.users = chat.users.filter((user: IUser["_id"]) => {
        return !users.includes(user.toString());
      });
    }

    await chat.save({ session });

    await User.updateMany(
      { _id: { $in: users } },
      { $pull: { chats: chatId } },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({ message: "User(s) removed from the chat" });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  }
};

// Controller to get a chat for user if they are one of the participants
export const getChat = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    const user = req.user as IUser;

    const chat = await Chat.findById(chatId).populate({
      path: "message",
      match: { users: user._id },
      select: "text sender tnd",
      populate: {
        path: "sender",
        select: "usertitle",
      },
    });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ chat });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
