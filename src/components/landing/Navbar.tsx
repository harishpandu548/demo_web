export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-charcoal/50 to-transparent px-6 py-6 sm:px-10 sm:py-8">
      <span className="font-serif text-xl tracking-[0.25em] text-ivory sm:text-2xl">
        OSSAGI
      </span>
      <nav className="hidden items-center gap-10 text-xs tracking-[0.2em] text-ivory/80 uppercase sm:flex">
        <a href="#collection" className="transition-colors hover:text-ivory">
          Collection
        </a>
        <a href="#about" className="transition-colors hover:text-ivory">
          About
        </a>
        <a href="#contact" className="transition-colors hover:text-ivory">
          Contact
        </a>
      </nav>
      <button
        type="button"
        className="text-xs tracking-[0.2em] text-ivory uppercase sm:hidden"
        aria-label="Open menu"
      >
        Menu
      </button>
    </header>
  );
}
