import Button from "../Button";

const TrackingBar = () => {
  return (
    <div class="h-14 flex shadow-md border gap-x-2 bg-white rounded-lg py-3 px-4">
      <input class="border border-[rgba(0,0,0,0.5)] pl-4 flex-1" />
      <Button>Start</Button>
    </div>
  );
};

export default TrackingBar;
