"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import config from "~/config";
import { ContactSchema, contactSchemaType } from "~/schema";
import { CustomLink } from "./mdx";
import Socials from "./socials";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { typo } from "./ui/typograpghy";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confettiFrame = useRef<number>();
  useEffect(() => () => {
    if (confettiFrame.current !== undefined) cancelAnimationFrame(confettiFrame.current);
    confetti.reset();
  }, []);

  function celebrate() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (confettiFrame.current !== undefined) cancelAnimationFrame(confettiFrame.current);
    const end = Date.now() + 3000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
    const frame = () => {
      if (Date.now() > end) return;
      for (const [x, angle] of [[0, 60], [1, 120]]) {
        void confetti({
          particleCount: 2,
          angle,
          spread: 55,
          startVelocity: 60,
          origin: { x, y: 0.5 },
          colors,
          disableForReducedMotion: true,
        });
      }
      confettiFrame.current = requestAnimationFrame(frame);
    };
    frame();
  }
  const form = useForm<contactSchemaType>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: contactSchemaType) {
    try {
      setIsSubmitting(true);
      // Send to both /api/contact and web3forms in parallel
      const [sheetRes, web3Res] = await Promise.all([
        fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        }),
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: "1e5bf407-153b-4427-9e16-ddb33c8de7bd",
            ...data,
          }),
        })
      ]);

      const web3Result = await web3Res.json();

      if (sheetRes.ok && web3Res.ok && web3Result.success) {
        toast.success("Thank you for contacting me!");
        form.reset();
        celebrate();
      } else {
        let errorMsg = "";
        if (!sheetRes.ok) {
          const errorData = await sheetRes.json();
          errorMsg += errorData?.error || "Failed to save to sheet. ";
        }
        if (!web3Res.ok || !web3Result.success) {
          errorMsg += web3Result.message || "Failed to send email.";
        }
        toast.error(errorMsg || "Something went wrong. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="contact" aria-label="contact" className="!mt-5">
      <div className="flex w-full flex-col items-center gap-4 md:flex-row">
        <div className="size-full space-y-4 md:max-w-xs">
          <h2 className={typo({ variant: "h2" })}>Get in Touch</h2>
          <p className="text-base text-muted-foreground">
            If you have any inquiries, please feel free to reach out. You can contact me via email
            at{" "}
            <CustomLink href={`mailto:${config.social.email}`} aria-label={config.social.email}>
              {config.social.email}
            </CustomLink>{" "}
          </p>

          <div className="space-y-3">
            <h3>Follow me </h3>
            <Socials />
          </div>
        </div>

        <Form {...form}>
          <form
            className="w-full space-y-3 rounded-md bg-[#131313] p-3 sm:space-y-4 sm:rounded-none sm:bg-transparent sm:p-0"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <h2 className="block text-center font-ubuntu text-lg sm:hidden">Fill this form</h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Full Name"
                        className="normal-case"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Phone No (optional)"
                        aria-label="Phone number (optional)"
                        autoComplete="tel"
                        className="normal-case"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input type="email" placeholder="Email" className="normal-case" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Message" className="normal-case" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default ContactUs;
