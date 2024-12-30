import getDB from "../../config/db";

const updateTracking = async (
  startTime: Date,
  currentTime: number,
  formattedTime: string,
  historyTrackingId: number,
) => {
  const db = await getDB();
  const endTime = new Date(
    new Date(startTime || 0).getTime() + currentTime * 1000,
  );
  await db.execute(
    "UPDATE tracking_history set formatted_time = ?, end_time = ? where id = ?",
    [formattedTime, endTime, historyTrackingId],
  );
};

export default updateTracking;
