import { DayInfo } from "@lib/calendar/WeekInfo";
import { Ref } from "react";

type NowMarkerProps = { ref?: Ref<HTMLDivElement> }

export default function NowMarker({ ref }: NowMarkerProps) {
    const dayInfo = new DayInfo();

    return <div className="now-marker" style={{top: `${dayInfo.minuteOfDay}px`}} ref={ref}></div>
}