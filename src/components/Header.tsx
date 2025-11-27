interface HeaderProps {
  totalTasks: number;
  isConnected: boolean;
}

export function Header({ totalTasks, isConnected }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">TaskMaster Demo</h1>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-gray-600">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="text-gray-600">
            {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
          </div>
        </div>
      </div>
    </header>
  );
}
