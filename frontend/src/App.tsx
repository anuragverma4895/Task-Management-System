import { useMemo, useState, type FormEvent } from "react";
import { Activity, ArrowDownUp, Bell, CalendarDays, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Command, Download, Filter, LayoutDashboard, ListTodo, LogOut, Menu, MoreHorizontal, Plus, Search, Settings2, Sparkles, Target, Users, X, Zap, Clock3 } from "lucide-react";

type Status = "To do" | "In progress" | "In review" | "Completed";
type Priority = "Urgent" | "High" | "Medium" | "Low";
type Task = { id: number; title: string; project: string; status: Status; priority: Priority; due: string; tag: string; assignee: string; checked: boolean };
const initialTasks: Task[] = [
  { id: 1, title: "Finalize onboarding flow", project: "Website redesign", status: "In progress", priority: "Urgent", due: "Today", tag: "Design", assignee: "AV", checked: false },
  { id: 2, title: "Review Q4 product roadmap", project: "Product strategy", status: "To do", priority: "High", due: "Today", tag: "Planning", assignee: "SK", checked: false },
  { id: 3, title: "Build analytics overview", project: "Website redesign", status: "In review", priority: "High", due: "Oct 27", tag: "Development", assignee: "RM", checked: false },
  { id: 4, title: "Update component library", project: "Design system", status: "In progress", priority: "Medium", due: "Oct 28", tag: "Design", assignee: "AV", checked: false },
  { id: 5, title: "Write release notes", project: "Mobile application", status: "To do", priority: "Low", due: "Oct 29", tag: "Content", assignee: "JL", checked: false },
  { id: 6, title: "Test payment edge cases", project: "Mobile application", status: "Completed", priority: "Medium", due: "Oct 22", tag: "Quality", assignee: "SK", checked: true }
];
const projects = [
  { name: "Website redesign", color: "purple", done: 72, total: "18 tasks" },
  { name: "Mobile application", color: "orange", done: 46, total: "24 tasks" },
  { name: "Design system", color: "green", done: 85, total: "12 tasks" },
  { name: "Product strategy", color: "blue", done: 34, total: "9 tasks" }
];
const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My tasks", icon: ListTodo, count: "8" },
  { label: "Calendar", icon: CalendarDays },
  { label: "Activity", icon: Activity }
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeNav, setActiveNav] = useState("Overview");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All tasks");
  const [showCreate, setShowCreate] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [dark, setDark] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("Medium");
  const [newDue, setNewDue] = useState("Tomorrow");
  const [notice, setNotice] = useState("");

  const visibleTasks = useMemo(() => tasks.filter(task => {
    const matchesQuery = [task.title, task.project, task.tag].join(" ").toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All tasks" || task.status === filter;
    const matchesNav = activeNav !== "My tasks" || task.assignee === "AV";
    return matchesQuery && matchesFilter && matchesNav;
  }), [tasks, query, filter, activeNav]);
  const completed = tasks.filter(task => task.status === "Completed").length;
  const inProgress = tasks.filter(task => task.status === "In progress").length;
  const overdue = tasks.filter(task => task.due === "Overdue" && task.status !== "Completed").length;
  const completion = tasks.length ? Math.round(completed / tasks.length * 100) : 0;

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }
  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setTasks(current => [{ id: Date.now(), title, project: "Personal workspace", status: "To do", priority: newPriority, due: newDue, tag: "New task", assignee: "AV", checked: false }, ...current]);
    setNewTitle(""); setNewPriority("Medium"); setNewDue("Tomorrow"); setShowCreate(false);
    flash("Task added to this session. Connect the API for persistence.");
  }
  function toggleTask(id: number) {
    setTasks(current => current.map(task => task.id === id ? { ...task, checked: !task.checked, status: task.checked ? "To do" : "Completed" } : task));
  }
  function changeStatus(id: number, status: Status) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status, checked: status === "Completed" } : task));
  }
  function exportTasks() {
    const header = ["Title", "Project", "Status", "Priority", "Due", "Tag"];
    const csv = [header, ...tasks.map(t => [t.title, t.project, t.status, t.priority, t.due, t.tag])]
      .map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "taskflow-tasks.csv"; link.click(); URL.revokeObjectURL(url);
    flash("CSV exported from the current preview task list.");
  }

  return <div className={dark ? "app-shell dark-theme" : "app-shell"}>
    <aside className={mobileNav ? "sidebar mobile-open" : "sidebar"}>
      <div className="brand-row"><div className="brand-mark"><Command size={19} strokeWidth={2.7}/></div><span className="brand-name">taskflow<span className="brand-dot">.</span></span><button className="icon-button sidebar-close" aria-label="Close navigation" onClick={() => setMobileNav(false)}><X size={18}/></button></div>
      <button className="workspace-switch"><span className="workspace-avatar">A</span><span className="workspace-copy"><strong>Acme Studio</strong><small>Preview workspace</small></span><ChevronDown size={15} className="muted-icon"/></button>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">{navItems.map(item => { const Icon = item.icon; return <button key={item.label} onClick={() => { setActiveNav(item.label); setMobileNav(false); }} className={activeNav === item.label ? "nav-item active" : "nav-item"}><Icon size={17}/><span>{item.label}</span>{item.count && <span className="nav-count">{item.count}</span>}</button>; })}</nav>
      <div className="sidebar-label project-label">YOUR PROJECTS <button className="tiny-plus" aria-label="Add project" onClick={() => flash("Projects need the backend integration.")}><Plus size={14}/></button></div>
      <div className="project-nav">{projects.map(project => <button className="project-link" key={project.name} onClick={() => { setQuery(project.name); setActiveNav("Overview"); }}><span className={"project-dot " + project.color}/><span>{project.name}</span></button>)}</div>
      <div className="sidebar-bottom">
        <div className="upgrade-card"><div className="upgrade-icon"><Sparkles size={16}/></div><strong>Make space for big ideas</strong><p>Bring your team together and do your best work.</p><button onClick={() => flash("Workspace plans are not connected yet.")}>Explore plans <ChevronRight size={14}/></button></div>
        <button className="nav-item utility-link" onClick={() => flash("Help center is not connected yet.")}><CircleHelp size={17}/><span>Help & support</span></button>
        <button className="nav-item utility-link" onClick={() => setDark(!dark)}><Settings2 size={17}/><span>Appearance</span><span className="theme-toggle">{dark ? "Dark" : "Light"}</span></button>
        <div className="profile-row"><div className="profile-avatar">AV</div><div className="profile-copy"><strong>Anurag Verma</strong><small>Preview account</small></div><button className="icon-button" aria-label="Profile options" onClick={() => setShowProfile(!showProfile)}><MoreHorizontal size={18}/></button>{showProfile && <div className="popover profile-popover"><button onClick={() => flash("Profile settings need authentication.")}>Account settings</button><button onClick={() => flash("Sign out will be wired with authentication.")}><LogOut size={14}/> Sign out</button></div>}</div>
      </div>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Close navigation overlay" onClick={() => setMobileNav(false)}/>}
    <main className="main-panel">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={14}/><strong>{activeNav}</strong></div><div className="topbar-actions">
        <label className="search-box"><Search size={16}/><input aria-label="Search tasks and projects" placeholder="Search anything..." value={query} onChange={event => setQuery(event.target.value)}/><kbd>⌘ K</kbd></label>
        <div className="action-wrapper"><button className={showNotifications ? "icon-button pressed" : "icon-button"} aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}><Bell size={18}/><span className="notification-dot"/></button>{showNotifications && <div className="popover notification-popover"><div className="popover-heading">Notifications <span>Preview</span></div><div className="notification-item"><span className="notification-symbol purple-bg"><Users size={15}/></span><div><strong>Workspace collaboration</strong><p>Connect a workspace to invite teammates.</p><small>Preview content</small></div></div><div className="notification-item"><span className="notification-symbol green-bg"><CheckCheck size={15}/></span><div><strong>Task completed</strong><p>Payment edge cases was completed.</p><small>Preview content</small></div></div><button className="popover-footer" onClick={() => { setShowNotifications(false); flash("Notifications are preview content until API integration."); }}>Close notifications <ChevronRight size={14}/></button></div>}</div>
        <div className="topbar-divider"/><button className="top-profile" onClick={() => setShowProfile(!showProfile)}><span className="profile-avatar small">AV</span><ChevronDown size={14}/></button>
      </div></header>
      <div className="page-content">
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/> SATURDAY, OCTOBER 24, 2026</div><h1>Good evening, Anurag <span className="wave">✳</span></h1><p className="welcome-subtitle">A little progress each day adds up to big results.</p></div><div className="welcome-actions"><button className="button button-secondary" onClick={exportTasks}><Download size={16}/> Export</button><button className="button button-primary" onClick={() => setShowCreate(true)}><Plus size={17}/> Create task</button></div></section>
        <section className="stats-grid" aria-label="Task statistics">
          <article className="stat-card"><div className="stat-top"><span className="stat-label">Total tasks</span><span className="stat-icon lavender"><ListTodo size={17}/></span></div><div className="stat-value">{String(tasks.length).padStart(2, "0")}<span className="stat-change positive"><ArrowDownUp size={12}/> all tasks</span></div><div className="stat-foot"><span className="mini-bars"><i/><i/><i/><i/><i/><i/><i/></span><span>Across your workspace</span></div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-label">In progress</span><span className="stat-icon blue-bg"><Clock3 size={17}/></span></div><div className="stat-value">{String(inProgress).padStart(2, "0")}<span className="stat-change neutral">Active now</span></div><div className="stat-foot"><span className="progress-track"><i style={{width: (tasks.length ? inProgress / tasks.length * 100 : 0) + "%"}}/></span><span>{tasks.length ? Math.round(inProgress / tasks.length * 100) : 0}% of tasks</span></div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-label">Completed</span><span className="stat-icon green-bg"><Check size={17}/></span></div><div className="stat-value">{String(completed).padStart(2, "0")}<span className="stat-change positive">On your way</span></div><div className="stat-foot"><span className="progress-track green-track"><i style={{width: completion + "%"}}/></span><span>{completion}% completion</span></div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-label">Overdue</span><span className="stat-icon orange-bg"><Zap size={17}/></span></div><div className="stat-value">{String(overdue).padStart(2, "0")}<span className={overdue ? "stat-change negative" : "stat-change positive"}>{overdue ? "Needs attention" : "All caught up"}</span></div><div className="stat-foot"><span className="overdue-spark">↗</span><span>Keep your momentum</span></div></article>
        </section>
        <section className="middle-grid">
          <article className="panel progress-panel"><div className="panel-heading"><div><h2>Your focus</h2><p>A snapshot of the current preview task list.</p></div><button className="icon-button" aria-label="Focus options" onClick={() => flash("Focus options can be configured after settings are connected.")}><MoreHorizontal size={19}/></button></div>
            <div className="focus-content"><div className="ring-wrap"><svg viewBox="0 0 120 120" className="progress-ring" role="img" aria-label={completion + "% completion"}><circle className="ring-bg" cx="60" cy="60" r="49"/><circle className="ring-fill" cx="60" cy="60" r="49" style={{strokeDasharray: (completion * 3.078) + " 308"}}/></svg><div className="ring-label"><strong>{completion}%</strong><span>completed</span></div></div>
              <div className="focus-legend"><div><span className="legend-dot legend-complete"/><div><strong>{completed} completed</strong><small>Nice work, keep going</small></div></div><div><span className="legend-dot legend-progress"/><div><strong>{inProgress} in progress</strong><small>Work in motion</small></div></div><div><span className="legend-dot legend-todo"/><div><strong>{tasks.length - completed - inProgress} to get started</strong><small>One step at a time</small></div></div></div></div>
            <div className="focus-note"><span className="note-spark"><Sparkles size={14}/></span><p><strong>Small steps count.</strong> Pick one important task and give it your full attention.</p></div>
          </article>
          <article className="panel projects-panel"><div className="panel-heading"><div><h2>Project progress</h2><p>Illustrative projects for the UI preview.</p></div><button className="text-button" onClick={() => flash("Project details require the projects API.")}>View all <ChevronRight size={14}/></button></div>
            <div className="project-progress-list">{projects.map(project => <div className="project-progress" key={project.name}><div className={"project-icon " + project.color}>{project.name.slice(0, 1)}</div><div className="project-progress-main"><div className="project-progress-title"><strong>{project.name}</strong><span>{project.done}%</span></div><div className="progress-track"><i className={"project-progress-fill " + project.color} style={{width: project.done + "%"}}/></div><small>{project.total}</small></div></div>)}</div>
          </article>
        </section>
        <section className="panel tasks-panel"><div className="panel-heading task-heading"><div><div className="title-with-count"><h2>{activeNav === "My tasks" ? "My tasks" : "Tasks overview"}</h2><span className="count-pill">{visibleTasks.length}</span></div><p>Preview data — actions here are not persisted.</p></div><button className="button button-small button-secondary" onClick={() => setFilter(filter === "All tasks" ? "In progress" : "All tasks")}><Filter size={14}/>{filter === "All tasks" ? "Filter" : "In progress"}<ChevronDown size={14}/></button></div>
          <div className="task-toolbar"><div className="task-tabs"><button className={filter === "All tasks" ? "task-tab selected" : "task-tab"} onClick={() => setFilter("All tasks")}>All tasks</button><button className={filter === "To do" ? "task-tab selected" : "task-tab"} onClick={() => setFilter("To do")}>To do</button><button className={filter === "In progress" ? "task-tab selected" : "task-tab"} onClick={() => setFilter("In progress")}>In progress</button><button className={filter === "Completed" ? "task-tab selected" : "task-tab"} onClick={() => setFilter("Completed")}>Completed</button></div><button className="icon-button sort-button" aria-label="Reverse task order" onClick={() => setTasks(current => [...current].reverse())}><ArrowDownUp size={15}/></button></div>
          <div className="task-table-wrap"><table className="task-table"><thead><tr><th className="check-col"><input type="checkbox" aria-label="Select all visible tasks" checked={visibleTasks.length > 0 && visibleTasks.every(task => task.checked)} onChange={() => setTasks(current => current.map(task => visibleTasks.some(v => v.id === task.id) ? {...task, checked: !visibleTasks.every(v => v.checked), status: !visibleTasks.every(v => v.checked) ? "Completed" : "To do"} : task))}/></th><th>Task name</th><th>Priority</th><th>Status</th><th>Due date</th><th>Assignee</th><th/></tr></thead>
            <tbody>{visibleTasks.map(task => <tr key={task.id} className={task.checked ? "completed-row" : ""}><td><input type="checkbox" aria-label={"Complete " + task.title} checked={task.checked} onChange={() => toggleTask(task.id)}/></td><td><div className="task-title-cell"><button className={task.checked ? "task-check checked" : "task-check"} aria-label={"Toggle " + task.title} onClick={() => toggleTask(task.id)}>{task.checked && <Check size={12}/>}</button><div><strong>{task.title}</strong><small>{task.project}</small></div></div></td><td><span className={"priority priority-" + task.priority.toLowerCase()}><span/>{task.priority}</span></td><td><select className={"status-select status-" + task.status.toLowerCase().replaceAll(" ", "-")} aria-label={"Status for " + task.title} value={task.status} onChange={event => changeStatus(task.id, event.target.value as Status)}><option>To do</option><option>In progress</option><option>In review</option><option>Completed</option></select></td><td><span className={task.due === "Today" ? "due-date due-today" : "due-date"}><CalendarDays size={13}/>{task.due}</span></td><td><span className="assignee-avatar">{task.assignee}</span></td><td><button className="icon-button row-menu" aria-label={"Remove " + task.title + " from preview"} onClick={() => { setTasks(current => current.filter(item => item.id !== task.id)); flash("Task removed from this session only."); }}><MoreHorizontal size={17}/></button></td></tr>)}</tbody></table>
            {visibleTasks.length === 0 && <div className="empty-state"><div className="empty-icon"><Search size={21}/></div><strong>No tasks found</strong><p>Try another search or change your filters.</p><button className="button button-secondary" onClick={() => {setQuery("");setFilter("All tasks");}}>Clear filters</button></div>}
          </div>
          <div className="table-footer"><span>Showing <strong>{visibleTasks.length}</strong> of <strong>{tasks.length}</strong> tasks <span className="footer-muted">· Local preview data</span></span><div className="pagination"><button className="icon-button" aria-label="Previous page" disabled><ChevronLeft size={16}/></button><button className="page-number active-page">1</button><button className="icon-button" aria-label="Next page" disabled><ChevronRight size={16}/></button></div></div>
        </section>
        <footer className="page-footer"><span>© 2026 TaskFlow. Built for thoughtful work.</span><span><span className="status-indicator"/> Preview mode <span className="footer-divider">·</span> Made with intention</span></footer>
      </div>
    </main>
    {showCreate && <div className="modal-backdrop" role="presentation" onMouseDown={event => {if (event.target === event.currentTarget) setShowCreate(false);}}><section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-task-title"><div className="modal-header"><div><span className="modal-kicker">NEW TASK</span><h2 id="create-task-title">Create a task</h2><p>Get it out of your head and into your plan.</p></div><button className="icon-button" aria-label="Close dialog" onClick={() => setShowCreate(false)}><X size={18}/></button></div>
      <form onSubmit={createTask}><label className="form-label">Task name<input autoFocus required maxLength={140} value={newTitle} onChange={event => setNewTitle(event.target.value)} placeholder="What needs to get done?"/></label><div className="form-two-col"><label className="form-label">Priority<select value={newPriority} onChange={event => setNewPriority(event.target.value as Priority)}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></label><label className="form-label">Due date<select value={newDue} onChange={event => setNewDue(event.target.value)}><option>Today</option><option>Tomorrow</option><option>Oct 27</option><option>Oct 28</option><option>No date</option></select></label></div><div className="modal-foot"><span><span className="modal-lock"><Target size={14}/></span> Preview workspace</span><div><button type="button" className="button button-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="button button-primary"><Plus size={15}/> Create task</button></div></div></form></section></div>}
    {notice && <div className="toast" role="status"><CheckCheck size={16}/>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={14}/></button></div>}
  </div>;
}
