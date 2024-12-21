import {
  createContext,
  createEffect,
  JSX,
  onCleanup,
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

  const stopTracking = () => {
    clearInterval(time.timer);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tracking, currentTime, ...rest } = time;
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
