import type { ReactNode } from 'react';
import Modal from './Modal';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium hover:bg-white/10"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={
              danger
                ? 'rounded-xl bg-red-500/20 px-3 py-2 text-sm font-medium text-red-100 hover:bg-red-500/30 border border-red-500/30'
                : 'rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-400'
            }
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      }
    >
      {description && <div className="text-sm text-white/70">{description}</div>}
    </Modal>
  );
}

