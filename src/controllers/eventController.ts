import mongoose from "mongoose";
import { Request, Response } from "express";
import { Event, validateEvent } from "../models/event";
import { Community } from "../models/community";
import { IUser } from "../models/user";

// Controller to create events - only allowed to admins of community
export const createEvent = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { error } = validateEvent(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, date, community } = req.body;

    const user = req.user as IUser;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const existingCommunity = await Community.findById(community);

    if (!existingCommunity) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if the user is an admin of the community
    const isAdminOfCommunity = existingCommunity.admins.includes(user._id);

    if (!isAdminOfCommunity) {
      return res
        .status(403)
        .json({ message: "User is not an admin of this community" });
    }

    const newEvent = await Event.create({
      title,
      description,
      date,
      community: existingCommunity._id,
    });

    existingCommunity.events.push(newEvent._id);
    existingCommunity.save({ session });

    session.commitTransaction();

    res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error: any) {
    session.endSession();
    res.status(500).json({ message: error.message });
  }
};

// Controller to get an event document
export const fetchEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId).populate("community");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ event });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to delete an event - only allowed to admins of community
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.id;
    const user = req.user as IUser;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const community = await Community.findById(event.community);

    if (!community) {
      return res
        .status(404)
        .json({ message: "Community not found for this event" });
    }

    // Check if the user is an admin of the community associated with the event
    const isAdminOfCommunity = community.admins.includes(user._id);

    if (!isAdminOfCommunity) {
      return res
        .status(403)
        .json({ message: "User is not an admin of this community" });
    }

    await Event.findByIdAndDelete(eventId);

    community.events = community.events.filter((eId: any) => eId !== eventId);
    community.save();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get all the community events
export const listCommunityEvents = async (req: Request, res: Response) => {
  try {
    const communityId = req.params.id;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const communityEvents = await Event.find({ community: communityId });

    res.status(200).json({ events: communityEvents });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
