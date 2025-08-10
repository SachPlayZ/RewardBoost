"use client"

import { motion, useInView } from "framer-motion"
import { useRef, type HTMLAttributes, type ReactNode } from "react"

interface AnimatedSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "scale"
  duration?: number
  stagger?: boolean
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.8,
  stagger = false,
  ...props
}: AnimatedSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
      x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
      scale: direction === "scale" ? 0.9 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration,
        ease: [0.33, 1, 0.68, 1],
        delay,
        ...(stagger && {
          staggerChildren: 0.1,
          delayChildren: delay,
        }),
      },
    },
  }

  const childVariants = stagger
    ? {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
        },
      }
    : undefined

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
      {...props}
    >
      {stagger ? <motion.div variants={childVariants}>{children}</motion.div> : children}
    </motion.div>
  )
}
