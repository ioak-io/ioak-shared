import mongoose from "mongoose";
import { APP_REALM, SERVICE_DOMAIN } from "../constants";

const getDatabaseName = (team: string) => {
  return `${APP_REALM}_${team}_${SERVICE_DOMAIN}`;
}

const defaultSchema = new mongoose.Schema({}, { strict: false });

export const getCollectionByName = (
  team: string,
  collectionName: string
): any => {
  const db = mongoose.connection.useDb(getDatabaseName(team));
  return db.model(collectionName, defaultSchema, collectionName);
};
