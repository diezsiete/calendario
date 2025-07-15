import { Ref } from "react";
import DayInfo from "@lib/calendar/DayInfo";

type NowMarkerProps = { ref?: Ref<HTMLDivElement>, zoom?: 1|2|4|12 }

export default function NowMarker({ ref, zoom = 1 }: NowMarkerProps) {
    const dayInfo = new DayInfo();

    return <div className="now-marker" style={{top: `${dayInfo.minuteOfDay * zoom}px`}} ref={ref}></div>
}