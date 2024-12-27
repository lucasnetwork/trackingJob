import {
  createContext,
  createEffect,
  JSX,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";
export interface TimerProps {
  tracking: boolean;
  startTime: Date;
  endTime: Date;
  timer: number;
  description: string;
  currentTime: number;
  formattedTime: string;
}
import Database from "@tauri-apps/plugin-sql";

interface TrackingContextType {
  time: TimerProps;
  startTracking: () => void;
  stopTracking: () => void;
  timers: Array<TrackingHistoryProps>;
  handleDescription: (description: string) => void;
}

export interface TrackingHistoryProps
  extends Omit<TimerProps, "currentTime" | "tracking" | "timer"> {
  id: number;
  tracking_history: (Omit<TimerProps, "currentTime" | "tracking" | "timer"> & {
    id: number;
  })[];
}

const TrackingContext = createContext<TrackingContextType | undefined>(
  undefined,
);

export const TrackingProvider = (props: { children: JSX.Element }) => {
  const [time, setTime] = createStore<TimerProps>({
    tracking: false,
    startTime: new Date(),
    endTime: new Date(),
    timer: 0,
    currentTime: 0,
    description: "",
    formattedTime: "00:00:00",
  });
  const [timers, setTimers] = createStore<Array<TrackingHistoryProps>>([]);
  const startTracking = () => {
    if (time.tracking) {
      return;
    }
    const interterval = setInterval(() => {
      setTime("currentTime", time.currentTime + 1);
    }, 1000);
    setTime("startTime", new Date());
    setTime("tracking", true);
    setTime("timer", interterval);
  };
  onMount(async () => {
    let dbName = "sqlite:production.db";
    if (import.meta.env.DEV) {
      dbName = "sqlite:development.db";
    }
    const db = await Database.load(dbName);

    const query = await db.select<
      {
        start_time: Date;
        end_time: Date;
        id: number;
        description: string;
        formatted_time: string;
        tracking_history_array: string;
      }[]
    >(
      `SELECT 
    history.*, 
   JSON_GROUP_ARRAY(
       JSON_OBJECT(
        'id', tracking_history.id,
        'start_time', tracking_history.start_time,
        'end_time', tracking_history.end_time,
        'description', tracking_history.description,
        'formatted_time', tracking_history.formatted_time,
        'created_at', tracking_history.created_at,
        'updated_at', tracking_history.updated_at
      )
    ) AS tracking_history_array
  FROM history 
  INNER JOIN tracking_history ON tracking_history.history_id = history.id 
  GROUP BY history.id 
  ORDER BY history.created_at DESC`,
    );
    console.log(
      "query",
      query.map(
        ({
          start_time,
          end_time,
          formatted_time,
          tracking_history_array,
          ...timer
        }) => ({
          ...timer,
          startTime: new Date(start_time),
          endTime: new Date(end_time),
          formattedTime: formatted_time,
          trackingHistory: JSON.parse(tracking_history_array),
        }),
      ),
    );

    setTimers(
      query.map(({ start_time, end_time, formatted_time, ...timer }) => {
        const trackingHistory = JSON.parse(
          timer.tracking_history_array,
        ) as Array<{
          id: number;
          start_time: Date;
          end_time: Date;
          description: string;
          formatted_time: string;
          created_at: Date;
          updated_at: Date;
        }>;
        return {
          ...timer,
          startTime: new Date(start_time),
          endTime: new Date(end_time),
          formattedTime: formatted_time,
          tracking_history: trackingHistory.map(
            ({ start_time, end_time, formatted_time, ...tracking }) => ({
              ...tracking,
              startTime: new Date(start_time),
              endTime: new Date(end_time),
              formattedTime: formatted_time,
            }),
          ),
        };
      }),
    );
  });
  const stopTracking = async () => {
    clearInterval(time.timer);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tracking, currentTime, ...rest } = time;
    let dbName = "sqlite:production.db";
    if (import.meta.env.DEV) {
      dbName = "sqlite:development.db";
    }
    const endTime = new Date(
      new Date(time.startTime || 0).getTime() + time.currentTime * 1000,
    );
    const db = await Database.load(dbName);

    await db.execute("BEGIN TRANSACTION");

    // Insert into history table
    const result = await db.execute(
      "INSERT INTO history (description, formatted_time, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING id",
      [time.description, time.formattedTime, time.startTime, endTime],
    );
    const historyId = result.lastInsertId;

    // Insert into tracking_history table
    const historyTrackingId = await db.execute(
      "INSERT INTO tracking_history (description, formatted_time, start_time, end_time, history_id) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [
        time.description,
        time.formattedTime,
        time.startTime,
        endTime,
        historyId,
      ],
    );

    await db.execute("COMMIT");
    setTimers([
      ...timers,
      {
        ...rest,
        id: historyId || 0,
        endTime: endTime,
        tracking_history: [
          {
            ...rest,
            id: historyTrackingId.lastInsertId || 0,
            endTime: endTime,
          },
        ],
      },
    ]);
    setTime("tracking", false);
    setTime("startTime", new Date());
    setTime("endTime", new Date());
    setTime("currentTime", 0);
    setTime("description", "");
  };

  const handleDescription = (description: string) => {
    setTime("description", description);
  };

  createEffect(() => {
    const hours = Math.floor(time.currentTime / 3600);
    const minutes = Math.floor((time.currentTime % 3600) / 60);
    const seconds = time.currentTime % 60;
    setTime(
      "formattedTime",
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
    );
  });

  onCleanup(() => {
    clearInterval(time.timer);
  });

  return (
    <TrackingContext.Provider
      value={{
        time: time,
        startTracking,
        stopTracking,
        timers,
        handleDescription,
      }}
    >
      {props.children}
    </TrackingContext.Provider>
  );
};

export const useTrackingProvider = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error(
      "useTrackingProvider must be used within a TrackingProvider",
    );
  }
  return context;
};
