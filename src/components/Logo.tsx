export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex gap-1 text-2xl">
        <span className="text-gray-900">♠</span>
        <span className="text-red-600">♥</span>
        <span className="text-red-600">♦</span>
        <span className="text-gray-900">♣</span>
      </div>
    </div>
  );
}
