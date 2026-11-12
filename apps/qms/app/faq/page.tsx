import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@alpin/ui/components/accordion";

const items = [
  {
    value: "item-1",
    trigger: "How do I reset my password?",
    content:
      "Passwords are managed by mqdms. Open your mqdms account settings, change your password there, then sign in to Alpin again.",
  },
  {
    value: "item-2",
    trigger: "How do I contact support?",
    content:
      "Send us a message from the support page and our team will get back to you as soon as possible.",
  },
];

export default function AccordionBasic() {
  return (
    <div className="flex min-h-svh p-6 flex-col gap-4 text-sm leading-loose">
      <Accordion type="single" collapsible defaultValue="item-1" className="max-w-lg">
        {items.map((item) => (
          <AccordionItem key={item.value} value={item.value}>
            <AccordionTrigger>{item.trigger}</AccordionTrigger>
            <AccordionContent>{item.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
