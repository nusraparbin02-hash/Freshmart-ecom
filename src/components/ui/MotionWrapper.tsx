import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface ElasticBadgeProps {
  count: number;
  className?: string;
}

export function ElasticBadge({ count, className }: ElasticBadgeProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (count > 0) {
      controls.start({
        scale: [1, 1.35, 0.95, 1],
        transition: { duration: 0.25, ease: 'easeInOut' }
      });
    }
  }, [count, controls]);

  if (count <= 0) return null;

  return (
    <motion.span
      animate={controls}
      className={className}
    >
      {count}
    </motion.span>
  );
}

interface FadeInSlideUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeInSlideUp({ children, delay = 0, className }: FadeInSlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.18, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface PageFadeProps {
  children: React.ReactNode;
}

export function PageFade({ children }: PageFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
