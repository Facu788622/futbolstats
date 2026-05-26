export default function ErrorMessage({ message }) {
  return (
    <div className="card border-red/30 bg-red-muted text-red text-sm text-center py-6">
      ⚠ {message || 'Ocurrió un error inesperado'}
    </div>
  )
}
