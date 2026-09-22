import React from 'react'

interface LoadingProps {
  message?: string
}

const Loading = ({ message = "En cours de chargement..." }: LoadingProps) => {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 gap-4">
      {/* Outer wrapper with subtle background pulse */}
      <div className="relative flex items-center justify-center">
        {/* Glowing backdrop effect */}
        <div className="absolute h-16 w-16 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        
        {/* Spinner ring */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500 shadow-sm" />
      </div>

      {/* Loading message */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 animate-pulse">
          {message}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Veuillez patienter un instant
        </p>
      </div>
    </div>
  )
}

export default Loading