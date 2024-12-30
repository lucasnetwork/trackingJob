import getDB from "../../config/db";
import { TimerProps } from "../../contexts/Tracking";

const createTracking = async (
  tracking: Omit<TimerProps, "tracking" | "timer">,
) => {
  const db = await getDB();

  await db.execute("BEGIN TRANSACTION");
  const endTime = new Date(
    new Date(tracking.startTime || 0).getTime() + tracking.currentTime * 1000,
  );
  // Insert into history table
  let historyId: number;
  if (tracking.id === undefined) {
    const result = await db.execute(
      "INSERT INTO history (description, formatted_time, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING id",
      [
        tracking.description,
        tracking.formattedTime,
        tracking.startTime,
        endTime,
      ],
    );
    historyId = result.lastInsertId || 0;
  } else {
    historyId = tracking.id;
  }

  // Insert into tracking_history table
  const historyTrackingId = await db.execute(
    "INSERT INTO tracking_history (description, formatted_time, start_time, end_time, history_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [
      tracking.description,
      tracking.formattedTime,
      tracking.startTime,
      endTime,
      historyId,
    ],
  );

  await db.execute("COMMIT");

  return {
    historyId,
    historyTrackingId: historyTrackingId.lastInsertId || 0,
  };
};

export default createTracking;
