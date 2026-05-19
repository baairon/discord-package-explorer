import type { Transition, Variants } from "framer-motion";
export const easeStandard: Transition = {
  duration: 0.18,
  ease: [0.4, 0, 0.2, 1]
};
export const easePane: Transition = {
  duration: 0.26,
  ease: [0.32, 0.72, 0, 1]
};
export const springLayout: Transition = {
  type: "spring",
  stiffness: 340,
  damping: 38,
  mass: 0.8
};
export const paneSwapVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] } }
};
export const conversationFadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, transition: { duration: 0.08, ease: [0.4, 0, 0.2, 1] } }
};
export const modalVariants: Variants = {
  enter: {
    opacity: 0,
    scale: 0.98
  },
  center: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    transition: {
      duration: 0.12,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};
export const overlayVariants: Variants = {
  enter: {
    opacity: 0,
    y: -4
  },
  center: {
    opacity: 1,
    y: 0,
    transition: easeStandard
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.12,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};
