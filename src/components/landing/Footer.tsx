export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-4 border-t border-charcoal/10 px-6 py-10 text-center sm:flex-row sm:justify-between sm:px-10">
      <span className="font-serif text-sm tracking-[0.2em]">OSSAGI</span>
      <p className="text-xs tracking-[0.2em] text-charcoal/50 uppercase">
        &copy; {new Date().getFullYear()} OSSAGI. All rights reserved.
      </p>
    </footer>
  );
}
