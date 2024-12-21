import { createSignal } from "solid-js";
import { useTrackingProvider } from "../../contexts/Tracking";
import Button from "../Button";

const TrackingBar = () => {
  const props = useTrackingProvider();
  const [description, setDescription] = createSignal("");
  return (
    <form
      onsubmit={(e) => {
        e.preventDefault();
        if (props.time.tracking) {
          console.log("oio");
          props.stopTracking();
          setDescription("");
          return;
        }
        props.startTracking(description());
      }}
      class="h-14 items-center flex shadow-md border gap-x-2 bg-white rounded-lg py-3 px-4"
    >
      <input
        value={description()}
        onInput={(e) => setDescription(e.target.value)}
        class="border border-[rgba(0,0,0,0.5)] pl-4 flex-1"
      />
      {props.time.tracking && <p>{props.time.formattedTime}</p>}
      <Button type="submit">{props.time.tracking ? "Stop" : "Start"}</Button>
    </form>
  );
};

export default TrackingBar;
