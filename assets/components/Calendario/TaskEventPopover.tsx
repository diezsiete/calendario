import classNames from "classnames";
import Floating, { FloatingProps } from "@components/Floating";
import ConfirmButton from "@components/Form/ConfirmButton";
import TaskEvent from "@lib/calendar/TaskEvent";
import '@styles/components/calendario/task-event-popover.scss';

type TaskPopoverProps = { taskEvent: TaskEvent|null, onDelete?: (taskEvent: TaskEvent) => void } & Omit<FloatingProps, 'children'|'isOpen'|'options'>;

export default function TaskEventPopover({ taskEvent, onDelete, className, ...floatingProps }: TaskPopoverProps) {
    if (!taskEvent) return null;

    return <Floating isOpen={!!taskEvent} options={{ position: 'right' }} className={classNames('task-event-popover', className)} {...floatingProps}>
        <p className="name">{taskEvent.name}</p>
        <ConfirmButton
            className='task-event-popover-confirm-button'
            onConfirm={() => onDelete?.(taskEvent)}
            label={<i className="bi bi-trash"></i>}
            labelCancel={<i className="bi bi-backspace"></i>}
            labelConfirm={<i className="bi bi-trash"></i>}
        />
    </Floating>
}