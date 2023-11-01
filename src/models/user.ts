import { Schema, model, Document, Types, PopulatedDoc, Model } from "mongoose";
import { IChat } from "./chat";
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  chats: Types.Array<Types.ObjectId | PopulatedDoc<IChat>>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  chats: [
    {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
});

const User: Model<IUser> = model<IUser>("User", userSchema);

export default User;
