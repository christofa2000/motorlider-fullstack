import { SITE_NAME, SUPPORT_EMAIL } from "../lib/constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-neutral-200)] bg-[var(--color-primary)] text-[var(--color-contrast)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[var(--color-neutral-300)]">
          &copy; {currentYear} {SITE_NAME}. Todos los derechos reservados.
        </p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-sm font-medium text-[var(--color-accent)] underline-offset-2 hover:text-[var(--color-contrast)] hover:underline transition-colors"
        >
          Contáctanos
        </a>
      </div>
    </footer>
  );
};

export default Footer;
