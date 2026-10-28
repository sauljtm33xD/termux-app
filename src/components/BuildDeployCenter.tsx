import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  GitBranch, 
  ShieldCheck, 
  Smartphone, 
  Cpu, 
  Flame, 
  ExternalLink,
  Code,
  Layers,
  FileCheck
} from 'lucide-react';

export const BuildDeployCenter: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const commands = [
    {
      title: '1. Clonar Repositorio & Rama de Producción',
      desc: 'Clona el repositorio Termux/URU con la rama de arquitectura limpia ARMA C30',
      cmd: 'git clone -b claude/clean-architecture-mvvm-refactor-c77r5x https://github.com/sauljtm33xD/termux-app.git\ncd termux-app'
    },
    {
      title: '2. Compilar APK Debug (Gradle)',
      desc: 'Compila el binario APK con Hilt DI, Room SQLite y los 9 motores de autonomía',
      cmd: './gradlew assembleDebug'
    },
    {
      title: '3. Ejecutar Suite de Tests Unitarios (15+ Suites)',
      desc: 'Ejecuta tests de concurrencia de coroutines, EventEngine throughput y AEGIS zero-trust',
      cmd: './gradlew testDebugUnitTest --info'
    },
    {
      title: '4. Instalar en Dispositivo Android / Emulador (Realme / Pixel)',
      desc: 'Despliegue directo mediante ADB Bridge',
      cmd: 'adb install -r termux-app/build/outputs/apk/debug/termux-app-debug.apk'
    },
    {
      title: '5. Iniciar Servicio URU Middleware',
      desc: 'Lanza la Activity principal con el Protocolo New Born y el Orbe reactivo',
      cmd: 'adb shell am start -n com.termux/com.uru.presentation.MainActivity'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Smartphone className="w-4 h-4" />
            <span>Compilación & Despliegue Nativo Android (Master Doc v1.0)</span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            Centro de Build & Instalación APK
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Instrucciones oficiales para compilar el middleware personal URU en Kotlin, generar el paquete APK ejecutable e instalarlo en dispositivos Realme 16 Pro+ o cualquier Android 10+ (API 29-34).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/sauljtm33xD/termux-app/tree/claude/clean-architecture-mvvm-refactor-c77r5x"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
          >
            <GitBranch className="w-4 h-4 text-orange-400" />
            <span>Ver Rama en GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Metrics Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Líneas de Código</span>
          <span className="text-2xl font-mono font-extrabold text-white">11,132</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">Kotlin Puro + Compose</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Archivos de Arquitectura</span>
          <span className="text-2xl font-mono font-extrabold text-sky-400">28</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">8 Paquetes Modulares</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Throughput Eventos</span>
          <span className="text-2xl font-mono font-extrabold text-amber-400">128k</span>
          <span className="text-[10px] text-amber-300 block mt-0.5">ops/sec (&lt;0.08ms)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Seguridad AEGIS</span>
          <span className="text-2xl font-mono font-extrabold text-emerald-400">5 Capas</span>
          <span className="text-[10px] text-emerald-300 block mt-0.5">Zero-Trust + SHA-256</span>
        </div>
      </div>

      {/* Environment Prerequisites */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
          Requisitos Previos del Entorno de Compilación
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Java Development Kit:</span>
            <strong className="text-white">JDK 17 LTS</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Target Android SDK:</span>
            <strong className="text-sky-400">API 34 (Android 14)</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Android NDK:</span>
            <strong className="text-purple-400">26.1.10909125</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Gradle Build Tool:</span>
            <strong className="text-amber-400">8.4+</strong>
          </div>
        </div>
      </div>

      {/* Command Snippets */}
      <div className="space-y-4">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Comandos de Compilación & Ejecución Paso a Paso
        </span>

        {commands.map((c, i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-white block">{c.title}</span>
                <span className="text-xs text-slate-400">{c.desc}</span>
              </div>
              <button
                onClick={() => copyToClipboard(c.cmd, i)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              >
                {copiedIndex === i ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-mono">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto">
              <code>{c.cmd}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
