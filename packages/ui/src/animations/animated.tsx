"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "../lib/cn";

export function FadeIn({ className, ...props }: HTMLMotionProps<"div">): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0.98 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.18 }}
      className={cn(className)}
      {...props}
    />
  );
}

export function SlideUp({ className, ...props }: HTMLMotionProps<"div">): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0.98, y: 4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.18 }}
      className={cn(className)}
      {...props}
    />
  );
}
