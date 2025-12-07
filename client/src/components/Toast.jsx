import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const toastRef = useRef(null);

  useEffect(() => {
    gsap.from(toastRef.current, {
      x: 400,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
    });

    const timer = setTimeout(() => {
      gsap.to(toastRef.current, {
        x: 400,
        opacity: 0,
        duration: 0.3,
        onComplete: onClose,
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    info: 'bg-accent-blue text-white',
    success: 'bg-cta-green text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
  };

  const typeIcons = {
    info: 'ri-information-line',
    success: 'ri-checkbox-circle-line',
    warning: 'ri-alert-line',
    error: 'ri-error-warning-line',
  };

  return (
    <div
      ref={toastRef}
      className={`fixed top-20 right-6 ${typeStyles[type]} px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 min-w-[300px]`}
    >
      <i className={`${typeIcons[type]} text-2xl`}></i>
      <span className="font-medium flex-1">{message}</span>
      <button onClick={onClose} className="text-xl hover:opacity-75">
        <i className="ri-close-line"></i>
      </button>
    </div>
  );
};

export default Toast;
