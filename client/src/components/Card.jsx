import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const Card = ({ title, icon, children, className = '', noPadding = false }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );

      const handleMouseEnter = () => {
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            y: -5,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            duration: 0.3,
          });
        }
      };

      const handleMouseLeave = () => {
        if (cardRef.current) {
          gsap.to(cardRef.current, {
            y: 0,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            duration: 0.3,
          });
        }
      };

      const card = cardRef.current;
      card.addEventListener('mouseenter', handleMouseEnter);
      card.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        if (card) {
          card.removeEventListener('mouseenter', handleMouseEnter);
          card.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}
    >
      {title && (
        <div className="bg-gradient-to-r from-primary-teal to-accent-blue text-white px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            {icon && <i className={`${icon} text-white`}></i>}
            {title}
          </h3>
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};

export default Card;
