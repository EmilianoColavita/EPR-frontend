export function ComingSoon({ title }: { title: string }) {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="font-display text-sm uppercase tracking-widest text-epr-green">
        Proximamente
      </span>
      <h1 className="font-display text-4xl uppercase tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="max-w-md text-foreground/60">
        Esta seccion esta en construccion. Muy pronto vas a poder ver todo el
        contenido aca.
      </p>
    </section>
  );
}
