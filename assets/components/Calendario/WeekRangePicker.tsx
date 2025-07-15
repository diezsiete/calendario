import { useContext } from "react";
import classNames from "classnames";
import WeekInfo from "@lib/calendar/WeekInfo";
import { CalendarContext, CalendarDispatch } from "@lib/state/calendar-state";
import '@styles/components/calendario/week-range-picker.scss'

export type NavigateWeekDirection = 'prev'|'next';
type WeekRangePickerProps = { weekInfo?: WeekInfo, onNavigateWeek?: (direction: NavigateWeekDirection) => void }

export default function WeekRangePicker({ className } : { className?: string }) {
    const context = useContext(CalendarContext);
    const dispatch = useContext(CalendarDispatch);

    function handleNavigateWeek(direction: NavigateWeekDirection) {
        dispatch({type: 'weekNavigated', weekInfo: direction === 'prev' ? context.weekInfo.getPrevWeek() : context.weekInfo.getNextWeek()})
    }

    return <div className={classNames('week-range-picker', className)}>
        <WeekRangePickerTrigger weekInfo={context.weekInfo} onNavigateWeek={handleNavigateWeek} />
    </div>
}

export function WeekRangePickerTrigger({ weekInfo, onNavigateWeek } : WeekRangePickerProps) {
    return <div className="btn-group week-range-picker-trigger">
        <button type="button" className="btn btn-outline navigate-week" onClick={() => onNavigateWeek?.('prev')}>
            <i className="bi bi-chevron-left"></i>
        </button>
        <button type="button" className="btn btn-outline week-label disabled">
            <i className="bi bi-calendar me-2"></i>
            {weekInfo.label}
        </button>
        <button type="button" className="btn btn-outline navigate-week" onClick={() => onNavigateWeek?.('next')}>
            <i className="bi bi-chevron-right"></i>
        </button>
    </div>
}