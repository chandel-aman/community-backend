import { Types, PopulatedDoc, Document, Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import { IMessage } from "./message";
import { InterfaceCommunity } from "./community";
import { IUser } from "./user";

export interface IChat extends Document {
  _id: Types.ObjectId;
  title: string;
  users: PopulatedDoc<IUser & Document>[];
  message: PopulatedDoc<IMessage & Document>;
  creator: PopulatedDoc<IUser & Document>;
  community: PopulatedDoc<InterfaceCommunity & Document>;
  status: string;
}

const chatSchema: Schema<IChat> = new Schema<IChat>({
  title: {
    type: String,
    required: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  message: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },

  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  community: {
    type: Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ["ACTIVE", "BLOCKED", "DELETED"],
    default: "ACTIVE",
  },
});

const chatModel = (): Model<IChat> => model<IChat>("Chat", chatSchema);

const Chat = (models.Chat || chatModel()) as ReturnType<typeof chatModel>;

export default Chat;
