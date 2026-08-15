export default function NetMoveModal({ metrics, onClose }) {
  if (!metrics) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={onClose}>
      <div
        className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">Net Movement Breakdown</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Purchases (+):</span>
            <span className="font-semibold">{metrics.purchases?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Transfers In (+):</span>
            <span className="font-semibold text-green-600">+{metrics.transfersIn?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Transfers Out (-):</span>
            <span className="font-semibold text-red-600">-{metrics.transfersOut?.toLocaleString()}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold">
            <span>Total Net:</span>
            <span>{metrics.netMovement?.toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-800 text-white py-2 rounded-md hover:bg-slate-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
