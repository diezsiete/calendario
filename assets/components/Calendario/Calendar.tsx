import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import WeekInfo, { DayInfo } from "@lib/calendar/WeekInfo";
import classNames from "classnames";
import rem from "@lib/idb/rem";
import NowMarker from "@components/Calendario/NowMarker";
import { formatSeconds } from "@lib/util/temporal";

const hours = Array.from({ length: 24 }, (_, i) => i ? String(i).padStart(2, '0') : i)

export default function Calendar() {
    const weekInfo = useMemo(() => new WeekInfo(), []);
    const [initialized, setInitialized] = useState(false);
    const calendarGridRef = useRef<HTMLDivElement>(null);
    const nowMarkerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        rem.calendarTasks.initWeek(...weekInfo.getWeekRangeSeconds()).then(() => setInitialized(true));
    }, [weekInfo]);

    useEffect(() => {
        if (initialized) {
            requestAnimationFrame(() => {
                if (calendarGridRef.current && nowMarkerRef.current) {
                    const markerTop = nowMarkerRef.current.offsetTop;
                    const contentHeight = calendarGridRef.current.clientHeight;
                    calendarGridRef.current.scrollTop = markerTop - contentHeight / 2;
                }
            });
        }
    }, [initialized]);

    return initialized && (<>
        <div className="calendar-grid-header">
            <div className="time-column">
                <div className="time-slot"></div>
            </div>
            {weekInfo.days.map(day => (
                <div key={day.dayOfMonth} className="day-column">
                    <div className="day-header">{day.name} {day.dayOfMonth}</div>
                </div>
            ))}
        </div>
        <div className="calendar-grid" ref={calendarGridRef}>
            <div className="time-column">
                {hours.map(hour =>
                    <div key={hour} className="time-slot">{hour ? <span>{hour}:00</span> : ''}</div>
                )}
            </div>
            {weekInfo.days.map(day => (
                <Day key={day.dayOfMonth} day={day} nowMarker={day.isToday && <NowMarker ref={nowMarkerRef} />}/>
            ))}
        </div>
    </>)
}

type DayProps = { day: DayInfo, nowMarker?: ReactElement<typeof NowMarker>|false };
function Day({ day, nowMarker }: DayProps ) {

    const tasks = rem.calendarTasks.getDayTasks(day.dayOfMonth);

    return <div className="day-column">
        {nowMarker}

        {tasks.map((task, index) => (
            <div key={index} className={classNames('event task', {short: task.minutesDuration <= 50})} style={{
                top: `${task.getMinuteOfDay(day.dayOfMonth)}px`,
                height: `${task.getMinutesDuration(day.dayOfMonth)}px`
            }}>
                {task.name}
                {task.timestampDuration && (
                    <div className="event-time">
                        {formatSeconds(task.timestampDuration)}{' '}
                        ({task.startInfo.formatTime()} - {task.endInfo.formatTime()})
                    </div>
                )}
            </div>
        ))}

        {hours.map(hour => <div key={hour} className="hour-cell"></div>)}
    </div>
}