import Database from "@tauri-apps/plugin-sql";

const getDB = async () => {
  let dbName = "sqlite:production.db";
  if (import.meta.env.DEV) {
    dbName = "sqlite:development.db";
  }
  const db = await Database.load(dbName);

  return db;
};

export default getDB;
