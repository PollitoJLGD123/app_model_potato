"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Bienvenido al sistema de detección de enfermedades en papa
        </p>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de estado */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Estado del Cultivo
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Plantas monitoreadas</span>
              <span className="font-semibold text-green-600">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Casos detectados</span>
              <span className="font-semibold text-red-600">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estado general</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Saludable
              </span>
            </div>
          </div>
        </div>

        {/* Card de análisis reciente */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Análisis Reciente
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            No hay análisis disponibles aún. Sube una imagen para comenzar.
          </p>
          <Link
            href="/dashboard/evaluation"
            className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Ir a Evaluación
          </Link>
        </div>

        {/* Card de acciones rápidas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Acciones Rápidas
          </h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/evaluation"
              className="block w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-left"
            >
              📸 Evaluar Imagen
            </Link>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-left">
              📊 Ver Reportes
            </button>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-left">
              ⚙️ Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
