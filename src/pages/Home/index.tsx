import TrackingBar from "../../components/TrackingBar";

const Home = () => {
  return (
    <div class="px-8 flex flex-col py-4">
      <TrackingBar />

      <div class="mt-6">
        <h2 class="text-2xl">History</h2>
        <div class="bg-white h-14 flex rounded-lg shadow-md  py-3 px-4 mt-4">
          <p class="flex-1 text-lg text-primary">Description</p>
          <div class="flex">
            <p class="border-dashed px-2 border-black border-l- border-r">
              8:30-9:30
            </p>
            <p class="border-dashed px-2 border-black border-r">1h:30m:10s</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
