import { X } from 'lucide-react';

interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SimpleTestModal({ isOpen, onClose }: SimpleModalProps) {
  console.log('SimpleTestModal rendered, isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('Simple modal not open');
    return null;
  }

  console.log('Simple modal should be visible');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Test Modal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p>This is a simple test modal. If you see this, the modal system works!</p>
        <button 
          onClick={onClose}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}