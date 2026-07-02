import { Types } from "mongoose";

export type WithObjectId<T> = T & { _id: Types.ObjectId };

export function getDocumentId(document: { _id?: Types.ObjectId }): string {
  if (!document._id) {
    throw new Error("Document id is missing");
  }

  return document._id.toString();
}
