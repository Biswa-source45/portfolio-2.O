// "01 — About" label plus a two-line masked headline revealed on scroll.
export default function SectionHead({ index, label, lines, className = '' }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted" data-fade>
        <span className="text-accent">{index}</span>
        <span className="h-px w-8 bg-line" />
        <span>{label}</span>
      </div>
      {lines && (
        <h2 data-reveal="lines" className="mt-6 font-display text-[clamp(2.4rem,6.5vw,6rem)] font-bold leading-[0.95] tracking-tight">
          {lines.map((line, i) => (
            <span key={i} className="reveal-mask block">
              <span className={`js-line block ${i === lines.length - 1 ? 'text-muted' : ''}`}>{line}</span>
            </span>
          ))}
        </h2>
      )}
    </div>
  );
}
