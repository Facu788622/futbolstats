export default function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-12 w-12 border-4' : 'h-8 w-8 border-3'
  return (
    <div className="flex justify-center items-center py-12">
      <div className={`${s} rounded-full border-pitch-border border-t-green animate-spin`} />
    </div>
  )
}
