import { For } from "solid-js";
import TrackingBar from "../../components/TrackingBar";
import { useTrackingProvider } from "../../contexts/Tracking";
import TrackingHistory from "../../components/TrackingHistory";

const Home = () => {
  const props = useTrackingProvider();
  return (
    <div class="px-8 flex flex-col py-4">
      <TrackingBar />

      <div class="mt-6">
        <h2 class="text-2xl">History</h2>
        <div class=" mt-4 flex flex-col gap-y-4">
          <For each={props.timers.data}>
            {(timer) => (
              <TrackingHistory
                description={timer.description}
                endTime={timer.endTime}
                id={timer.id}
                formattedTime={timer.formattedTime}
                startTime={timer.startTime}
                tracking_history={timer.tracking_history}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default Home;
