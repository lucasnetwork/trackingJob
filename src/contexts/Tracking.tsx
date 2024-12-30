import {
  createContext,
  createEffect,
  createSignal,
  JSX,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
export interface TimerProps {
  tracking: boolean;
  startTime: Date;
  endTime: Date;
  timer: number;
  description: string;
  currentTime: number;
  formattedTime: string;
  id?: number;
}
import { format } from "date-fns";
import getDB from "../config/db";
import createTracking from "../services/tracking/create";
import updateTracking from "../services/tracking/update";

interface TimerHistory {
  dateFormated: string;
  data: Array<TrackingHistoryProps>;
}

interface TrackingContextType {
  time: TimerProps;
  startTracking: (id?: number) => void;
  stopTracking: () => void;
  timers: {
    count: number;
    data: Array<TimerHistory>;
  };
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
  const [timeHistoryTrackingId, setTimeHistoryTrackingId] =
    createSignal<number>();
  const [timers, setTimers] = createStore<{
    count: number;
    data: Array<TimerHistory>;
  }>({
    count: 0,
    data: [],
  });

  const updateListTimers = (
    time: Omit<TimerProps, "tracking" | "timer">,
    {
      historyId,
      historyTrackingId,
    }: { historyId: number; historyTrackingId: number },
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tracking, currentTime, ...rest } = time;
    const endTime = new Date(
      new Date(time.startTime || 0).getTime() + time.currentTime * 1000,
    );
    const newTimers = timers.data;
    const dateFormated = format(new Date(time.startTime), "dd/MM/yyyy");
    let index: number | undefined = undefined;
    let indexDate: number | undefined = undefined;

    for (let i = 0; i < newTimers.length; i++) {
      if (newTimers[i].dateFormated === dateFormated) {
        index = i;
        for (let j = 0; j < newTimers[i].data.length; j++) {
          if (newTimers[i].data[j].id === time.id) {
            indexDate = j;
            break;
          }
        }
        break;
      }
    }
    if (index === undefined) {
      const newTimer = {
        ...rest,
        startTime: time.startTime,
        endTime: endTime,
        id: historyId,
        tracking_history: [
          {
            ...rest,
            startTime: time.startTime,
            endTime: endTime,
            id: historyTrackingId,
          },
        ],
      };
      setTimers("data", () => [
        {
          data: [newTimer],
          dateFormated: dateFormated,
        },
        ...newTimers,
      ]);
      return;
    }
    if (indexDate === undefined) {
      const newTimer = {
        startTime: time.startTime,
        endTime: endTime,
        formattedTime: time.formattedTime,
        description: time.description,
        id: historyId,
        tracking_history: [
          {
            formattedTime: time.formattedTime,
            description: time.description,
            startTime: time.startTime,
            endTime: endTime,
            id: historyTrackingId,
          },
        ],
      };
      setTimers("data", index, (data) => {
        return {
          ...data,
          data: [newTimer, ...data.data],
        };
      });
      return;
    }

    setTimers(
      "data",
      index,
      produce((data) => {
        const indexHistory = data.data[indexDate].tracking_history.findIndex(
          (history) => history.id === historyTrackingId,
        );
        const trackingHistory = data.data;
        if (indexHistory !== -1) {
          trackingHistory[indexDate].tracking_history[indexHistory].endTime =
            endTime;
          trackingHistory[indexDate].tracking_history[
            indexHistory
          ].formattedTime = time.formattedTime;
        } else {
          trackingHistory[indexDate].tracking_history.push({
            ...rest,
            startTime: time.startTime,
            endTime: endTime,
            id: historyTrackingId,
          });
        }
        return {
          ...data,
          data: trackingHistory,
        };
      }),
    );
  };

  createEffect<{
    timers: {
      count: number;
      data: Array<TimerHistory>;
    };
  }>(
    (timers) => {
      if (
        time.id === undefined ||
        timeHistoryTrackingId() === undefined ||
        !time.tracking
      ) {
        return timers;
      }
      updateListTimers(time, {
        historyId: time.id || 0,
        historyTrackingId: timeHistoryTrackingId() || 0,
      });
      return timers;
    },
    { timers },
  );

  const startTracking = async (id?: number) => {
    if (time.tracking) {
      return;
    }
    const interterval = setInterval(() => {
      setTime("currentTime", time.currentTime + 1);
    }, 1000);
    const startTime = new Date();
    setTime("startTime", startTime);
    setTime("tracking", true);
    setTime("timer", interterval);
    setTime("id", id);
    const newTimer = {
      id,
      currentTime: 0,
      description: time.description,
      startTime,
      formattedTime: "00:00:00",
      endTime: new Date(),
    };
    const response = await createTracking(newTimer);
    setTimeHistoryTrackingId(response.historyTrackingId);
    setTime("id", response.historyId);
  };

  onMount(async () => {
    const db = await getDB();
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

    setTimers("count", query.length);
    const currentTimers: { [key: string]: TimerHistory } = {};
    query.forEach(({ start_time, end_time, formatted_time, ...timer }) => {
      const dateFormated = format(new Date(start_time), "dd/MM/yyyy");
      if (!currentTimers[dateFormated]) {
        currentTimers[dateFormated] = {
          dateFormated,
          data: [],
        };
      }
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
      const currentTimer = {
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
      currentTimers[dateFormated].data.push(currentTimer);
    });
    setTimers("data", Object.values(currentTimers));
  });

  const stopTracking = async () => {
    clearInterval(time.timer);
    const historyId = timeHistoryTrackingId();
    if (!historyId) {
      return;
    }

    await updateTracking(
      time.startTime,
      time.currentTime,
      time.formattedTime,
      historyId,
    );
    updateListTimers(time, {
      historyId: time.id || 0,
      historyTrackingId: historyId,
    });
    setTimeHistoryTrackingId(undefined);
    setTime("tracking", false);
    setTime("startTime", new Date());
    setTime("endTime", new Date());
    setTime("currentTime", 0);
    setTime("description", "");
    setTime("id", undefined);
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

  createEffect(async () => {
    const historyTrackingId = timeHistoryTrackingId();
    if (!time.tracking || historyTrackingId === undefined) {
      return;
    }
    const verifyIfTimeIsDivisibleBy30 = time.currentTime % 30 === 0;
    if (!verifyIfTimeIsDivisibleBy30 || time.currentTime === 0) {
      return;
    }
    await updateTracking(
      time.startTime,
      time.currentTime,
      time.formattedTime,
      historyTrackingId,
    );
  });

  onCleanup(() => {
    clearInterval(time.timer);
  });
  const value = {
    time: time,
    startTracking,
    stopTracking,
    timers: timers,
    handleDescription,
  };
  return (
    <TrackingContext.Provider value={value}>
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
