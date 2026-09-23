import Spinner from "./Spinner"

interface LoadingProps {
	message?: string
}

const Loading = ({ message = "En cours de chargement..." }: LoadingProps) => {
	return (
		<div className="min-h-[400px] w-full flex flex-col items-center justify-center p-6 gap-4">
			<Spinner color="primary" size={"xl"}/>

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