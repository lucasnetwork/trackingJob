import { format } from "date-fns";
import { TrackingHistoryProps } from "../../contexts/Tracking";

const TrackingHistory = (props: TrackingHistoryProps) => {
  const startDateFormated = format(props.startTime, "HH:mm");
  const endDateFormated = format(props.endTime, "HH:mm");
  return (
    <div class="bg-white h-14 flex rounded-lg shadow-md  py-3 px-4">
      <p class="flex-1 text-lg text-primary">{props.description}</p>
      <div class="flex">
        <p class="border-dashed px-2 border-black border-l- border-r">
          {startDateFormated}-{endDateFormated}
        </p>
        <p class="border-dashed px-2 border-black border-r">
          {props.formattedTime}
        </p>
      </div>
    </div>
  );
};

export default TrackingHistory;
