import { useMemo } from "react";
import { CalendarDays, CheckCircle2, Circle, Clock3 } from "lucide-react";

interface CalendarTask {
  _id?: string;
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: "To do" | "In progress" | "In review" | "Completed";
  priority: "Urgent" | "High" | "Medium" | "Low";
}

interface CalendarPanelProps {
  tasks: CalendarTask[];
}

export default function CalendarPanel({ tasks }: CalendarPanelProps) {
  const groups = useMemo(() => {
    const byDate = new Map<string, CalendarTask[]>();
    tasks.forEach(task => {
      const key = task.dueDate ? dateKey(new Date(task.dueDate)) : "no-date";
      byDate.set(key, [...(byDate.get(key) ?? []), task]);
    });
    return Array.from(byDate.entries()).sort(([a], [b]) => {
      if (a === "no-date") return 1;
      if (b === "no-date") return -1;
      return a.localeCompare(b);
    });
  }, [tasks]);

  return <section className="panel calendar-panel">
    <div className="panel-heading"><div><h2>Task calendar</h2><p>Tasks grouped by their due dates.</p></div><span className="count-pill">{tasks.length}</span></div>
    {tasks.length === 0 ? <div className="calendar-empty"><CalendarDays size={26}/><strong>Your calendar is clear</strong><span>Create a task and give it a due date to see it here.</span></div>
      : <div className="calendar-agenda">{groups.map(([date, entries]) => <section className="calendar-group" key={date}>
        <div className="calendar-date"><CalendarDays size={16}/><strong>{date === "no-date" ? "No due date" : new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</strong><span>{entries.length} task{entries.length === 1 ? "" : "s"}</span></div>
        {entries.map(task => {
          const done = task.status === "Completed";
          const overdue = !done && task.dueDate !== null && date < dateKey(new Date());
          return <article className="calendar-entry" key={task.id}>
            <span className={done ? "calendar-entry-status done" : overdue ? "calendar-entry-status overdue" : "calendar-entry-status"}>{done ? <CheckCircle2 size={17}/> : overdue ? <Clock3 size={17}/> : <Circle size={17}/>}</span>
            <div className="calendar-entry-copy"><strong>{task.title}</strong><p>{task.description || "No description added"}</p></div>
            <span className={overdue ? "calendar-priority calendar-overdue" : "calendar-priority"}>{overdue ? "Overdue" : done ? "Completed" : task.priority}</span>
          </article>;
        })}
      </section>)}</div>}
  </section>;
}

function dateKey(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
