import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">
        Bienvenido al panel principal. Usa los enlaces siguientes para navegar por
        la aplicación.
      </p>
      <ul className="space-y-2">
        <li>
          <Link
            href="/dashboard/modulos"
            className="text-blue-600 hover:underline"
          >
            Gestión de módulos &rarr;
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/periodos"
            className="text-blue-600 hover:underline"
          >
            Periodos &rarr;
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/realtime"
            className="text-blue-600 hover:underline"
          >
            Evaluación en tiempo real &rarr;
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/history"
            className="text-blue-600 hover:underline"
          >
            Historial de predicciones &rarr;
          </Link>
        </li>
      </ul>
    </div>
  );
}
