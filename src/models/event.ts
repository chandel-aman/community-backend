import mongoose, { Schema, Document, Model, Types } from "mongoose";
import Joi from 'joi';

export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  community: mongoose.Types.ObjectId;
}

const EventSchema: Schema<IEvent> = new Schema({
  title: { type: String, required: true, minLength: 5 },
  description: { type: String, required: true, minLength: 10 },
  date: { type: Date, required: true },
  community: {
    type: Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
});

const eventValidationSchema = Joi.object({
  title: Joi.string().required().min(5),
  description: Joi.string().required().min(10),
  date: Joi.date().required(),
  community: Joi.string().required(),
});

export const validateEvent = (data: any) => {
  return eventValidationSchema.validate(data);
};


export const Event: Model<IEvent> = mongoose.model<IEvent>(
  "Event",
  EventSchema
);
