export function MitLockup() {
  return (
    <div className="flex h-10 items-center gap-2.5" aria-label="MIT">
      <svg viewBox="0 0 44 28" className="h-7" fill="currentColor" aria-hidden="true">
        <rect x="0" y="4" width="6" height="20" />
        <rect x="9" y="4" width="6" height="14" />
        <rect x="18" y="4" width="6" height="20" />
        <rect x="27" y="4" width="6" height="14" />
        <rect x="27" y="20" width="17" height="4" />
        <rect x="36" y="4" width="8" height="14" />
      </svg>
      <div className="leading-tight">
        <div className="font-serif text-[13px] font-semibold tracking-tight">Massachusetts</div>
        <div className="font-serif text-[13px] font-semibold tracking-tight">Institute of</div>
        <div className="font-serif text-[13px] font-semibold tracking-tight">Technology</div>
      </div>
    </div>
  );
}

export function StanfordLockup() {
  return (
    <div className="flex flex-col items-center leading-none" aria-label="Stanford University">
      <div className="font-serif text-[26px] font-semibold tracking-tight">Stanford</div>
      <div className="mt-1 font-serif text-[15px] tracking-wide">University</div>
    </div>
  );
}

export function BerkeleyLockup() {
  return (
    <div className="flex flex-col items-center leading-none" aria-label="Berkeley">
      <div className="font-serif text-[30px] font-semibold italic tracking-tight">Berkeley</div>
      <div className="mt-1.5 font-sans text-[9px] tracking-[0.2em]">UNIVERSITY OF CALIFORNIA</div>
    </div>
  );
}

export function CmuLockup() {
  return (
    <div className="flex h-10 items-center gap-2" aria-label="Carnegie Mellon University">
      <svg
        viewBox="0 0 24 32"
        className="h-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path
          d="M2 3 L22 3 L22 18 Q22 26 12 30 Q2 26 2 18 Z"
          fill="currentColor"
          fillOpacity="0.15"
        />
        <line x1="12" y1="6" x2="12" y2="24" />
        <line x1="4" y1="14" x2="20" y2="14" />
      </svg>
      <div className="font-serif text-[13px] font-semibold leading-tight tracking-tight">
        <div>Carnegie</div>
        <div>Mellon</div>
        <div>University</div>
      </div>
    </div>
  );
}

export function WaterlooLockup() {
  return (
    <div className="flex h-10 items-center gap-2" aria-label="University of Waterloo">
      <svg
        viewBox="0 0 24 32"
        className="h-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M2 3 L22 3 L22 18 Q22 26 12 30 Q2 26 2 18 Z" />
        <path d="M7 10 L9 20 L12 12 L15 20 L17 10" />
      </svg>
      <div className="font-sans leading-tight">
        <div className="text-[9px] tracking-[0.22em]">UNIVERSITY OF</div>
        <div className="text-[18px] font-bold tracking-[0.06em]">WATERLOO</div>
      </div>
    </div>
  );
}

export function UniversityStrip({ label }: { label: string }) {
  return (
    <section className="mx-auto max-w-[1280px] px-8 py-10">
      <div className="mb-8 text-center font-sans text-sm text-muted-foreground">{label}</div>
      <div className="flex items-stretch justify-center gap-12 text-muted-foreground/80">
        <MitLockup />
        <span className="w-px bg-hairline" />
        <StanfordLockup />
        <span className="w-px bg-hairline" />
        <BerkeleyLockup />
        <span className="w-px bg-hairline" />
        <CmuLockup />
        <span className="w-px bg-hairline" />
        <WaterlooLockup />
      </div>
    </section>
  );
}
