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

export type TrackingHistoryProps = Omit<TimerProps, "currentTime" | "tracking">;

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
    const db = await Database.load("sqlite:test2.db");
    const query = await db.select<
      {
        start_time: Date;
        end_time: Date;
        timer: number;
        description: string;
        formatted_time: string;
      }[]
    >("SELECT * FROM history");
    console.log("quedry", query);
    setTimers(
      query.map(({ start_time, end_time, formatted_time, ...timer }) => ({
        ...timer,
        startTime: new Date(start_time),
        endTime: new Date(end_time),
        formattedTime: formatted_time,
      })),
    );
    console.log("query", query);
  });
  const stopTracking = async () => {
    clearInterval(time.timer);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tracking, currentTime, ...rest } = time;
    const db = await Database.load("sqlite:test2.db");

    await db.execute(
      "INSERT into history (description, formatted_time,start_time,end_time) VALUES ($1, $2, $3,$4)",
      [time.description, time.formattedTime, time.startTime, time.endTime],
    );
    setTimers([
      ...timers,
      {
        ...rest,
        endTime: new Date(
          new Date(time.startTime || 0).getTime() + time.currentTime * 1000,
        ),
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
