"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

interface FaqRowProps {
  faq: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqRow({ faq, isOpen, onToggle }: FaqRowProps) {
  const shouldReduceMotion = useReducedMotion();

  function handleSummaryClick(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    onToggle();
  }

  return (
    <details
      open={isOpen}
      className="border-b border-border last:border-b-0"
    >
      <summary
        onClick={handleSummaryClick}
        className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden"
      >
        <span>{faq.question}</span>
        <ChevronDown
          aria-hidden="true"
          className={`size-5 shrink-0 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </summary>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </details>
  );
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function handleToggle(index: number) {
    setOpenIndex((current) => (current === index ? null : index));
  }

  return (
    <section className="bg-muted py-16 lg:py-24">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="mb-8 font-heading text-4xl text-foreground lg:text-5xl">
          Perguntas frequentes
        </h2>
        <div className="rounded-xl border border-border bg-card px-6 text-card-foreground">
          {faqs.map((faq, index) => (
            <FaqRow
              key={faq.question}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
