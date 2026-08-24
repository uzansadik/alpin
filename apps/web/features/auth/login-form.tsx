"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@upkick/auth/client";
import { Button } from "@upkick/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@upkick/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@upkick/ui/components/field";
import { Input } from "@upkick/ui/components/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { type LoginValues, loginSchema } from "./schemas";

type LoginFormProps = {
  next: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    form.clearErrors("root");

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: next,
    });

    if (error) {
      if (error.status === 403) {
        const params = new URLSearchParams({
          email: values.email,
          next,
        });

        router.push(`/verify-email?${params.toString()}`);

        return;
      }

      form.setError("root", {
        message: error.message ?? "Unable to sign in. Please try again.",
      });

      return;
    }

    router.replace(next);
    router.refresh();
  }

  const registerParams = new URLSearchParams({
    next,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your credentials to continue.</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            {form.formState.errors.root && <FieldError errors={[form.formState.errors.root]} />}

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                    <Button asChild variant="link" size="sm">
                      <Link href="/forgot-password">Forgot password?</Link>
                    </Button>
                  </div>

                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Don&apos;t have an account?</span>

          <Button asChild variant="link" size="sm">
            <Link href={`/register?${registerParams.toString()}`}>Create account</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
