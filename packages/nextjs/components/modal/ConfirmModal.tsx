interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-base-100 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-base-300">
        <h3 className="text-2xl font-bold mb-6 text-center text-white tracking-wide">
          ⚠️ {title}
        </h3>
        <p className="text-center mb-10 text-lg leading-relaxed text-gray-300">
          {message}
        </p>
        <div className="flex justify-center gap-6">
          <button 
            className="btn btn-outline min-w-[120px] text-lg"
            onClick={onClose}
          >
            取消
          </button>
          <button 
            className="btn btn-primary min-w-[120px] text-lg"
            onClick={onConfirm}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 