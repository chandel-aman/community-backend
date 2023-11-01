import { Schema, model, Document, Types, Model, models } from "mongoose";

interface InterfaceCommunity extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  isPublic: boolean;
  creator: Types.ObjectId;
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  members: Types.ObjectId[];
  admins: Types.ObjectId[];
  chats: Types.ObjectId[];
  posts: Types.ObjectId[];
  pinnedPosts: Types.ObjectId[];
  membershipRequests: Types.ObjectId[];
  events: Types.ObjectId[];
  blockedUsers: Types.ObjectId[];
  visibleInSearch?: boolean;
  createdAt: Date;
}

const communitySchema = new Schema<InterfaceCommunity>({
  name: {
    type: String,
    required: true,
    minlength: 6,
  },
  description: {
    type: String,
    required: true,
    minlength: 20,
  },
  isPublic: {
    type: Boolean,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["ACTIVE", "BLOCKED", "DELETED"],
    default: "ACTIVE",
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  admins: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  chats: [
    {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  pinnedPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
      default: [],
    },
  ],
  membershipRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: "MembershipRequest",
    },
  ],
  events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
  blockedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  visibleInSearch: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Community =
  (models.Community as Model<InterfaceCommunity>) ||
  model<InterfaceCommunity>("Community", communitySchema);

export { InterfaceCommunity, Community };
