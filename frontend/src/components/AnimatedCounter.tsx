import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  duration = 1.5,
  className = ''
}) => {
  const counterRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (counterRef.current) {
      const counter = { value: prevValueRef.current };
      
      gsap.to(counter, {
        value: value,
        duration: duration,
        ease: "power2.out",
        onUpdate: () => {
          if (counterRef.current) {
            const displayValue = Math.round(counter.value);
            counterRef.current.textContent = `${prefix}${displayValue}${suffix}`;
          }
        }
      });
      
      prevValueRef.current = value;
    }
  }, [value, prefix, suffix, duration]);

  return <span ref={counterRef} className={className}>{prefix}0{suffix}</span>;
};