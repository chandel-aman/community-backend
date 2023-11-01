import { Document, Schema, Model, model, Types } from "mongoose";
import { IUser } from "./user";

export interface IMessage extends Document {
  _id: Types.ObjectId;
  messages: {
    text: string;
    media: string;
    sender: {
      name: string;
      id: Types.ObjectId | IUser["_id"];
    };
    tnd: Date;
    read: {
      status: boolean;
      time?: Date;
    };
    reactions: {
      reaction: string;
      by: Types.ObjectId | IUser["_id"];
    }[];
  }[];
  unseenMessages: {
    count: number;
  };
  updatedDate: Date;
}

const messageSchema: Schema<IMessage> = new Schema({
  messages: [
    {
      text: {
        type: String,
        required: true,
      },
      media: { type: String, default: "" },
      sender: {
        name: { type: String, required: true },
        id: { type: Schema.Types.ObjectId, ref: "User" },
      },
      tnd: {
        type: Date,
        required: true,
      },
      read: {
        status: { type: Boolean, default: false },
        time: { type: Date },
      },
      reactions: [
        {
          reaction: { type: String },
          by: { type: Schema.Types.ObjectId, ref: "User" },
        },
      ],
    },
  ],
  unseenMessages: {
    count: { type: Number, default: 0 },
  },
  updatedDate: { type: Date, default: Date.now() },
});

messageSchema.pre<IMessage>("save", function (next) {
  this.updatedDate = new Date();
  next();
});

const Message: Model<IMessage> = model<IMessage>("Message", messageSchema);

export default Message;
