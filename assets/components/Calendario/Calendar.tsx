import { MouseEvent, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import NowMarker from "@components/Calendario/NowMarker";
import TaskEventPopover from "@components/Calendario/TaskEventPopover";
import TaskEvent from "@lib/calendar/TaskEvent";
import WeekInfo, { DayInfo } from "@lib/calendar/WeekInfo";
import rem from "@lib/idb/rem";
import { formatSeconds } from "@lib/util/temporal";

type TaskEventPopoverState = {taskEvent: TaskEvent|null, anchor: HTMLElement | null};

const hours = Array.from({ length: 24 }, (_, i) => i ? String(i).padStart(2, '0') : i)

export default function Calendar() {
    const weekInfo = useMemo(() => new WeekInfo(), []);
    const calendarGridRef = useRef<HTMLDivElement>(null);
    const nowMarkerRef = useRef<HTMLDivElement>(null);
    const [initialized, setInitialized] = useState(false);
    const [taskEventPopoverState, setTaskEventPopoverState] = useState<TaskEventPopoverState>({taskEvent: null, anchor: null})

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

    function handleTaskEventClick(taskEvent: TaskEvent, e: MouseEvent) {
        setTaskEventPopoverState({ taskEvent, anchor: e.currentTarget as HTMLDivElement })
    }

    function handleTaskEventDelete(taskEvent: TaskEvent) {
        rem.calendarTasks.removeDayTask(taskEvent).then(() => setTaskEventPopoverState({ taskEvent: null, anchor: null}))
    }

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
            {weekInfo.days.map(day => <Day
                key={day.dayOfMonth}
                day={day}
                nowMarker={day.isToday && <NowMarker ref={nowMarkerRef} />}
                onTaskEventClick={handleTaskEventClick}
            />)}
        </div>
        <TaskEventPopover
            taskEvent={taskEventPopoverState.taskEvent}
            onClose={() => setTaskEventPopoverState({taskEvent: null, anchor: null})}
            onDelete={handleTaskEventDelete}
            anchorElement={taskEventPopoverState.anchor}
        />
    </>)
}

type DayProps = { day: DayInfo, nowMarker?: ReactElement<typeof NowMarker>|false, onTaskEventClick?: TaskEventClickHandler };
function Day({ day, nowMarker, onTaskEventClick }: DayProps ) {

    const tasks = rem.calendarTasks.getDayTasks(day.dayOfMonth);

    return <div className="day-column">
        {nowMarker}

        {tasks.map((task, index) =>
            <TaskEventComponent key={index} taskEvent={task} day={day} onClick={onTaskEventClick} />
        )}

        {hours.map(hour => <div key={hour} className="hour-cell"></div>)}
    </div>
}

type TaskEventClickHandler = (taskEvent: TaskEvent, e: MouseEvent) => void;
type TaskEventProps = { taskEvent: TaskEvent, day: DayInfo, onClick?: TaskEventClickHandler};
function TaskEventComponent({ taskEvent, day, onClick }: TaskEventProps) {

    const style = {
        top: `${taskEvent.getMinuteOfDay(day.dayOfMonth)}px`,
        height: `${taskEvent.getMinutesDuration(day.dayOfMonth)}px`,
        backgroundColor: taskEvent.color
    }

    return <div className={classNames('event', {short: taskEvent.minutesDuration <= 50})} style={style}
                onClick={e => onClick?.(taskEvent, e)}>
        {taskEvent.name}
        {taskEvent.timestampDuration && (
            <div className="event-time">
                {formatSeconds(taskEvent.timestampDuration)}{' '}
                ({taskEvent.startInfo.formatTime()} - {taskEvent.endInfo.formatTime()})
            </div>
        )}
    </div>
}