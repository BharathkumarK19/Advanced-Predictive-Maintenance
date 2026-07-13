import { useEffect, useRef, useState } from "react";
import { clamp, formatNumber } from "../../utils/format";

type AnimatedNumberProps = {
  value: number;
  precision?: number;
  durationMs?: number;
  className?: string;
};

export const AnimatedNumber = ({ value, precision = 0, durationMs = 480, className }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const displayValueRef = useRef(value);

  useEffect(() => {
    let frame = 0;
    const startValue = displayValueRef.current;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = clamp((now - startTime) / durationMs, 0, 1);
      const nextValue = startValue + (value - startValue) * progress;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frame = window.requestAnimationFrame(animate);
      } else {
        displayValueRef.current = value;
      }
    };

    frame = window.requestAnimationFrame(animate);

    return () => window.cancelAnimationFrame(frame);
  }, [durationMs, value]);

  return <span className={className}>{formatNumber(displayValue, precision)}</span>;
};
