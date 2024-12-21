import { useTrackingProvider } from "../../contexts/Tracking";
import Button from "../Button";

const TrackingBar = () => {
  const props = useTrackingProvider();
  return (
    <form
      onsubmit={(e) => {
        e.preventDefault();
        if (props.time.tracking) {
          props.stopTracking();
          return;
        }
        props.startTracking();
      }}
      class="h-14 items-center flex shadow-md border gap-x-2 bg-white rounded-lg py-3 px-4"
    >
      <input
        value={props.time.description}
        onInput={(e) => props.handleDescription(e.target.value)}
        class="border border-[rgba(0,0,0,0.5)] pl-4 flex-1"
      />
      {props.time.tracking && <p>{props.time.formattedTime}</p>}
      <Button type="submit">{props.time.tracking ? "Stop" : "Start"}</Button>
    </form>
  );
};

export default TrackingBar;
