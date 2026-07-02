import { Types } from "mongoose";

export type WithObjectId<T> = T & { _id: Types.ObjectId };

type RefLike =
  | Types.ObjectId
  | string
  | { _id?: Types.ObjectId | string; toString?: () => string };

export function getDocumentId(document: { _id?: Types.ObjectId | string }): string {
  if (!document._id) {
    throw new Error("Document id is missing");
  }

  return document._id.toString();
}

export function getRefIdString(ref: RefLike): string {
  if (ref instanceof Types.ObjectId) {
    return ref.toString();
  }

  if (typeof ref === "string") {
    return ref;
  }

  if (ref._id) {
    return ref._id.toString();
  }

  throw new Error("Reference id is missing");
}
