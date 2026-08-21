export function AdminComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="font-display text-sm uppercase tracking-widest text-epr-green">
        Próximamente
      </span>
      <h1 className="font-heading text-4xl font-bold uppercase tracking-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-md font-heading font-light text-foreground/60">
        Esta sección está en construcción. Muy pronto vas a poder gestionar{" "}
        {title.toLowerCase()} desde acá.
      </p>
    </div>
  );
}
