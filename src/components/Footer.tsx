import { SITE_NAME, SUPPORT_EMAIL } from "../lib/constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {currentYear} {SITE_NAME}. Todos los derechos reservados.</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
        >
          Contáctanos
        </a>
      </div>
    </footer>
  );
};

export default Footer;
