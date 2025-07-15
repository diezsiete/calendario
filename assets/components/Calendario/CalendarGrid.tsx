import { MouseEvent, ReactElement, useContext, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import NowMarker from "@components/Calendario/NowMarker";
import TaskEventPopover from "@components/Calendario/TaskEventPopover";
import TaskEvent from "@lib/calendar/TaskEvent";
import DayInfo from "@lib/calendar/DayInfo";
import rem from "@lib/idb/rem";
import { formatSeconds } from "@lib/util/temporal";
import { CalendarContext } from "@lib/state/calendar-state";

type TaskEventPopoverState = {taskEvent: TaskEvent|null, anchor: HTMLElement | null};

function buildTimeSlots(zoom: 1|2|4|12 = 1) {
    const slots = [];
    for (let i = 0; i < 24; i++) {
        slots.push(String(i).padStart(2, '0') + ':00');
        for (let j = 1; j < 12; j++) {
            if (zoom === 12 || (zoom > 1 && j === 6) || (zoom > 2 && j % 3 === 0)) {
                slots.push(String(i).padStart(2, '0') + ':' + String(j * 5).padStart(2, '0'));
            }
        }
    }
    return slots;
}

export default function CalendarGrid() {
    const context = useContext(CalendarContext);
    const calendarGridRef = useRef<HTMLDivElement>(null);
    const nowMarkerRef = useRef<HTMLDivElement>(null);
    const [taskEventPopoverState, setTaskEventPopoverState] = useState<TaskEventPopoverState>({taskEvent: null, anchor: null})
    const [zoom, setZoom] = useState<1|2|4|12>(1);
    const [timeSlots, setTimeSlots] = useState(() => buildTimeSlots(zoom))

    useEffect(() => {
        requestAnimationFrame(() => {
            if (calendarGridRef.current && nowMarkerRef.current) {
                const markerTop = nowMarkerRef.current.offsetTop;
                const contentHeight = calendarGridRef.current.clientHeight;
                calendarGridRef.current.scrollTop = markerTop - contentHeight / 2;
            }
        });
    }, []);

    function handleTaskEventClick(taskEvent: TaskEvent, e: MouseEvent) {
        setTaskEventPopoverState({ taskEvent, anchor: e.currentTarget as HTMLDivElement })
    }

    function handleTaskEventDelete(taskEvent: TaskEvent) {
        rem.calendarTasks.removeDayTask(taskEvent).then(() => setTaskEventPopoverState({ taskEvent: null, anchor: null}))
    }

    function handleZoom(newZoom: 1|2|4|12) {
        setZoom(newZoom);
        setTimeSlots(buildTimeSlots(newZoom))
    }

    return <>
        <div className="calendar-grid-header">
            <div className="time-column">
                <div className="time-slot">
                    <button className={classNames('btn btn-outline zoom', {disabled: zoom === 1})}
                            onClick={() => handleZoom(zoom === 12 ? 4 : zoom / 2 as 1 | 2 | 4 | 12)}>
                        <i className="bi bi-dash-circle"></i>
                    </button>
                    <button className={classNames('btn btn-outline zoom', {disabled: zoom === 12})}
                            onClick={() => handleZoom(zoom === 4 ? 12 : zoom * 2 as 1 | 2 | 4 | 12)}>
                        <i className="bi bi-plus-circle"></i>
                    </button>
                </div>
            </div>
            {context.weekInfo.days.map(day => (
                <div key={day.dayOfMonth} className="day-column">
                    <div className="day-header">{day.name} {day.dayOfMonth}</div>
                </div>
            ))}
        </div>
        <div className="calendar-grid" ref={calendarGridRef}>
            <div className="time-column">
                {/*{hours.map(hour => <div key={hour} className="time-slot">{hour ? <span>{hour}:00</span> : ''}</div>)}*/}
                {timeSlots.map(timeSlot =>
                    <div key={timeSlot} className="time-slot"><span>{timeSlot}</span></div>
                )}
            </div>
            {context.weekInfo.days.map(day => <Day
                key={day.dayOfMonth}
                day={day}
                timeSlots={timeSlots}
                zoom={zoom}
                nowMarker={day.isToday && <NowMarker ref={nowMarkerRef} zoom={zoom} />}
                onTaskEventClick={handleTaskEventClick}
            />)}
        </div>
        <TaskEventPopover
            taskEvent={taskEventPopoverState.taskEvent}
            onClose={() => setTaskEventPopoverState({taskEvent: null, anchor: null})}
            onDelete={handleTaskEventDelete}
            anchorElement={taskEventPopoverState.anchor}
        />
    </>
}

type DayProps = {
    day: DayInfo,
    timeSlots: string[],
    zoom?: 1|2|4|12,
    nowMarker?: ReactElement<typeof NowMarker>|false,
    onTaskEventClick?: TaskEventClickHandler
};
function Day({ day, timeSlots, zoom = 1, nowMarker, onTaskEventClick }: DayProps ) {

    const tasks = rem.calendarTasks.getDayTasks(day.dayOfMonth);

    return <div className="day-column">
        {nowMarker}

        {tasks.map((task, index) =>
            <TaskEventComponent key={index} taskEvent={task} day={day} zoom={zoom} onClick={onTaskEventClick} />
        )}

        {timeSlots.map(hour => <div key={hour} className="hour-cell"></div>)}
    </div>
}

type TaskEventClickHandler = (taskEvent: TaskEvent, e: MouseEvent) => void;
type TaskEventProps = { taskEvent: TaskEvent, day: DayInfo, zoom?: 1|2|4|12, onClick?: TaskEventClickHandler};
function TaskEventComponent({ taskEvent, day, zoom = 1, onClick }: TaskEventProps) {

    const style = {
        top: `${taskEvent.getMinuteOfDay(day.dayOfMonth, zoom)}px`,
        height: `${taskEvent.getMinutesDuration(day.dayOfMonth, zoom)}px`,
        backgroundColor: taskEvent.color
    }

    return <div className={classNames('event', {short: taskEvent.minutesDuration <= 50})} style={style}
                onClick={e => onClick?.(taskEvent, e)}>
        {taskEvent.name}
        {taskEvent.timestampDuration ? (
            <div className="event-time">
                {formatSeconds(taskEvent.timestampDuration)}{' '}
                ({taskEvent.startInfo.formatTime()} - {taskEvent.endInfo.formatTime()})
            </div>
        ) : null}
    </div>
}