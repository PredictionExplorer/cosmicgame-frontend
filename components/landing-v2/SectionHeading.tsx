import type { ReactNode } from 'react';

import styles from './Landing.module.css';

interface SectionHeadingProps {
  eyebrow: string;
  heading: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={`${styles.sectionHeading} ${align === 'center' ? 'mx-auto text-center' : ''} ${className ?? ''}`}
    >
      <p className={`${styles.sectionEyebrow} ${align === 'center' ? 'justify-center' : ''}`}>
        {eyebrow}
      </p>
      <h2 className={styles.sectionTitle}>{heading}</h2>
      {description && (
        <p className={`${styles.sectionDescription} ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  );
}
