import { format } from "date-fns";
import {
  TrackingHistoryProps,
  useTrackingProvider,
} from "../../contexts/Tracking";
import { BsPlay, BsStop } from "solid-icons/bs";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { RiArrowsArrowDownSFill } from "solid-icons/ri";
interface DTO extends Omit<TrackingHistoryProps, "timer"> {
  tracking?: boolean;
}

const TrackingHistory = (props: DTO) => {
  const { startTracking, stopTracking } = useTrackingProvider();
  const startDateFormated = format(props.startTime, "HH:mm");
  const [endDateFormated, setEndDateFormat] = createSignal(
    format(props.endTime, "HH:mm"),
  );
  const [showHistory, setShowHistory] = createSignal(false);

  createEffect(() => {
    setEndDateFormat(format(props.endTime, "HH:mm"));
  });

  const totalTime = createMemo(() => {
    const totalTime =
      props.tracking_history.reduce((acc, curr) => {
        return acc + (curr.endTime.getTime() - curr.startTime.getTime());
      }, 0) / 1000;
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const seconds = totalTime % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  });

  return (
    <div>
      <div
        class={`bg-white h-14 flex  ${props.tracking_history.length > 1 ? "rounded-t-lg" : "rounded-lg"} shadow-md  py-3 px-4`}
      >
        <p class="flex-1 text-lg text-primary">{props.description}</p>
        <div class="flex">
          <p class="border-dashed px-2 border-black border-l- border-r">
            {startDateFormated}-{endDateFormated()}
          </p>
          <p class="border-dashed px-2 border-black border-r">{totalTime()}</p>
        </div>
        <Show
          when={props.tracking}
          fallback={
            <button type="button" onClick={() => startTracking(props.id)}>
              <BsPlay class="text-primary" size={32} />
            </button>
          }
        >
          <button type="button" onClick={stopTracking}>
            <BsStop class="text-primary" size={32} />
          </button>
        </Show>
        <button
          class={`${showHistory() ? "rotate-180" : ""}`}
          type="button"
          onClick={() => setShowHistory(!showHistory())}
        >
          <RiArrowsArrowDownSFill class="text-primary" size={32} />
        </button>
      </div>
      <Show when={showHistory()}>
        <For each={props.tracking_history}>
          {(history, index) => {
            const startDateFormated = format(history.startTime, "HH:mm");
            const [endDateFormated, setEndDateFormat] = createSignal(
              format(history.endTime, "HH:mm"),
            );
            createEffect(() => {
              setEndDateFormat(format(history.endTime, "HH:mm"));
            });
            return (
              <div
                class={`bg-slate-100 ${index() + 1 === props.tracking_history.length ? "rounded-lg" : ""} h-14 flex  shadow-md  py-3 px-4`}
              >
                <p class="flex-1 text-lg text-primary">{history.description}</p>
                <div class="flex">
                  <p class="border-dashed px-2 border-black border-l- border-r">
                    {startDateFormated}-{endDateFormated()}
                  </p>
                  <p class="border-dashed px-2 border-black border-r">
                    {history.formattedTime}
                  </p>
                </div>
              </div>
            );
          }}
        </For>
      </Show>
    </div>
  );
};

export default TrackingHistory;
