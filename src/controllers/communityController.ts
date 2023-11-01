import { Request, Response } from "express";
import { Community } from "../models/community";
import { IUser } from "../models/user";

// Controller function to create a new community
export const createCommunity = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newCommunityData = {
      ...req.body.community,
      creator: user._id,
    };

    const newCommunity = await Community.create(newCommunityData);
    res.status(201).json(newCommunity);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Controller function to delete a community
export const deleteCommunity = async (req: Request, res: Response) => {
  try {
    const communityId = req.params.id;

    const deletedCommunity = await Community.findByIdAndDelete(communityId);

    if (!deletedCommunity) {
      return res.status(404).json({ message: "Community not found" });
    }

    res.status(200).json({ message: "Community deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to list communities
export const listCommunities = async (req: Request, res: Response) => {
  try {
    const publicCommunities = await Community.find({ isPublic: true });
    res.status(200).json(publicCommunities);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to search a community
export const searchCommunity = async (req: Request, res: Response) => {
  try {
    const communityName = req.query.name as string;

    const searchResults = await Community.find({
      name: new RegExp(communityName, "i"),
      visibleInSearch: true,
    });

    res.status(200).json(searchResults);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to join a community
export const joinCommunity = async (req: Request, res: Response) => {
  try {
    const user = req?.user as IUser;

    const communityId = req.params.id;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isMember = community.members.includes(user._id);

    if (isMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of the community" });
    }

    community.members.push(user._id);
    await community.save();

    res.status(200).json({ message: "User successfully joined the community" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to remove a member from the community
export const removeMember = async (req: Request, res: Response) => {
  try {
    const { memberId, communityId } = req.body;

    const user = req.user as IUser;

    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const isAdminOfCommunity = community.admins.includes(user._id);

    if (!isAdminOfCommunity) {
      return res
        .status(403)
        .json({ message: "User is not an admin of this community" });
    }

    const memberIndex = community.members.indexOf(memberId);

    if (memberIndex === -1) {
      return res
        .status(404)
        .json({ message: "Member not found in this community" });
    }

    community.members.splice(memberIndex, 1);
    await community.save();

    res.status(200).json({ message: "Member removed successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
