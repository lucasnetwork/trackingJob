import { For } from "solid-js";
import TrackingBar from "../../components/TrackingBar";
import { useTrackingProvider } from "../../contexts/Tracking";

const Home = () => {
  const props = useTrackingProvider();
  return (
    <div class="px-8 flex flex-col py-4">
      <TrackingBar />

      <div class="mt-6">
        <h2 class="text-2xl">History</h2>
        <div class=" mt-4 flex flex-col gap-y-4">
          <For each={props.timers}>
            {(timer) => (
              <div class="bg-white h-14 flex rounded-lg shadow-md  py-3 px-4">
                <p class="flex-1 text-lg text-primary">{timer.description}</p>
                <div class="flex">
                  <p class="border-dashed px-2 border-black border-l- border-r">
                    8:30-9:30
                  </p>
                  <p class="border-dashed px-2 border-black border-r">
                    1h:30m:10s
                  </p>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default Home;
