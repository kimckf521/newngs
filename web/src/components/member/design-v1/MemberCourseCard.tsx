import { Card, Icon, Bar, GradientButton, SoftButton } from './parts';

/**
 * The course card a STUDENT sees in their portal course list. Extracted so the
 * admin "student preview" renders the exact same markup (single source of truth).
 * Labels are passed in (decoupled from the member content), so the admin can feed
 * them from the design-v1 strings for the right locale.
 */
export type CourseCardData = { id?: string; name: string; modules: { title: string }[]; progress: number };
export type CourseCardLabels = { modulesWord: string; completeWord: string; continue: string; viewModules: string };

export function MemberCourseCard({ c, labels }: { c: CourseCardData; labels: CourseCardLabels }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-24 bg-ngs-gradient">
        <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% -20%, #fff 0, transparent 50%)' }} />
        <span className="absolute bottom-3 left-4 grid h-11 w-11 place-items-center rounded-xl bg-white/20 text-white ring-1 ring-white/30"><Icon name="book" className="h-5 w-5" /></span>
      </div>
      <div className="p-5">
        <h3 className="font-grotesk text-base font-bold leading-snug text-slate-900">{c.name}</h3>
        <p className="mt-1 text-xs text-slate-400">{c.modules.length} {labels.modulesWord} · {c.progress}% {labels.completeWord}</p>
        <div className="mt-3 flex items-center gap-3"><Bar value={c.progress} /><span className="shrink-0 text-xs font-semibold text-slate-500">{c.progress}%</span></div>
        <ul className="mt-4 space-y-1.5">
          {c.modules.slice(0, 3).map((mod, i) => (
            <li key={`${mod.title}-${i}`} className="flex items-center gap-2 truncate text-[13px] text-slate-500">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ngs-gradient" />
              <span className="truncate">{mod.title}</span>
            </li>
          ))}
          {c.modules.length > 3 && <li className="pl-3.5 text-[12px] text-slate-400">+{c.modules.length - 3}</li>}
        </ul>
        <div className="mt-5 flex gap-2.5">
          <GradientButton className="flex-1">{labels.continue}<Icon name="play" className="h-3.5 w-3.5" /></GradientButton>
          <SoftButton>{labels.viewModules}</SoftButton>
        </div>
      </div>
    </Card>
  );
}
