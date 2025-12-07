import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
        display: 'flex',
      });
      gsap.from(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });
    } else if (!isOpen && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          if (overlayRef.current) {
            overlayRef.current.style.display = 'none';
          }
        },
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-primary-teal text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
