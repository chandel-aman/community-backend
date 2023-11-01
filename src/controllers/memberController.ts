import { Request, Response } from "express";
import { Community } from "../models/community";
import { IUser } from "../models/user";

export const leaveCommunity = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    const communityId = req.params.id;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const memberIndex = community.members.indexOf(user._id);

    if (memberIndex === -1) {
      return res
        .status(404)
        .json({ message: "User is not a member of this community" });
    }

    community.members.splice(memberIndex, 1);
    await community.save();

    res.status(200).json({ message: "User left the community successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
