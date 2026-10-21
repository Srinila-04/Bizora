import React from 'react';
import baseImg from '../assets/welcome-character-base.png';
import handImg from '../assets/welcome-waving-hand.png';

/**
 * WelcomeHeaderIllustration
 * 
 * High-fidelity, animated illustration reproducing the original Bizora Welcome Header reference:
 * - Friendly young woman in a royal purple top and camel skirt
 * - Prominent upper body, cheerful expression, and wavy dark hair
 * - Surrounding floating gift boxes, heart shopping bag, gold paper bag, kraft bag, and sparkle stars
 * - Smooth, gentle repeating wave animation of the hand/arm around a natural wrist/elbow pivot
 * - Transparent background seamlessly integrating into the lavender banner
 * - Full prefers-reduced-motion accessibility support
 */
export const WelcomeHeaderIllustration = ({ className = '' }) => {
  return (
    <div
      className={`relative select-none pointer-events-none flex items-center justify-center shrink-0 ${className}`}
      role="img"
      aria-label="Illustration of a friendly young woman in a purple outfit waving hello with floating gift boxes and shopping bags"
    >
      <style>{`
        @keyframes customer-waving-hand {
          0% {
            transform: rotate(0deg);
          }
          18% {
            transform: rotate(-12deg);
          }
          36% {
            transform: rotate(10deg);
          }
          54% {
            transform: rotate(-10deg);
          }
          72% {
            transform: rotate(6deg);
          }
          90% {
            transform: rotate(-3deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .customer-wave-anim {
          transform-origin: 41.67% 49.52%;
          animation: customer-waving-hand 2.4s ease-in-out infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .customer-wave-anim {
            animation: none !important;
          }
        }
      `}</style>

      {/* Aspect Ratio Container matching the original 654:340 (1.923:1) proportion */}
      <div className="relative w-full aspect-[654/340] max-h-[220px]">
        {/* Base illustration: character, torso, skirt, hair, face, gifts, bags, and sparkles */}
        <img
          src={baseImg}
          alt=""
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* Waving Hand Layer positioned precisely over the sleeve cuff */}
        <div
          className="absolute customer-wave-anim"
          style={{
            left: '29.05%',
            top: '23.53%',
            width: '18.35%',
            height: '61.76%',
          }}
        >
          <img
            src={handImg}
            alt=""
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeHeaderIllustration;
