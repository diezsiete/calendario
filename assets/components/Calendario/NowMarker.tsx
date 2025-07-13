import { Ref } from "react";
import DayInfo from "@lib/calendar/DayInfo";

type NowMarkerProps = { ref?: Ref<HTMLDivElement> }

export default function NowMarker({ ref }: NowMarkerProps) {
    const dayInfo = new DayInfo();

    return <div className="now-marker" style={{top: `${dayInfo.minuteOfDay}px`}} ref={ref}></div>
}