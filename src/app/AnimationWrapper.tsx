// AnimationWrapper.tsx
'use client'

import { AnimatePresence, motion, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from 'react';

// Define the subtle variants, explicitly typed as Variants
const subtleFadeScaleVariants: Variants = {
  // Page starts slightly transparent and scaled down
  initial: { 
    opacity: 0, 
    scale: 0.98, 
  },
  
  // Animates into view
  animate: { 
    opacity: 1, 
    scale: 1, 
    // Transition for the entry phase
    transition: { 
        duration: 0.4, 
        ease: [0.6, -0.05, 0.01, 0.99] // Smoother, standard easing array
    } 
  },
  
  // Exits by fading out and scaling down slightly again
  exit: { 
    opacity: 0, 
    scale: 0.99, 
    // Transition for the exit phase (faster)
    transition: { 
        duration: 0.3, 
        ease: [0.6, -0.05, 0.01, 0.99] // Match ease for consistency
    } 
  },
};

export default function AnimationWrapper({
  children,
}: {
  children: ReactNode;
}) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait"> 
            <motion.div 
                key={pathname}
                variants={subtleFadeScaleVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                // CRITICAL: Remove the top-level 'transition' prop completely.
                // The transition properties are now correctly nested within the variants.
                
                style={{ 
                    // CRITICAL FIX: These styles prevent content flash/flicker
                    position: 'absolute', 
                    width: '100%', 
                    minHeight: '100vh',
                    top: 0,
                    left: 0,
                    // IMPORTANT: Replace #fff with your actual page background color/variable
                    backgroundColor: 'var(--page-background-color, #fff)', 
                }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}