import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { FORM_DATA } from "../-data";
import { FormSchema, type TFormSchema } from "../-type";
import { useResetPassword } from "../-api/use-reset-password";

const darkInput =
  "bg-[#2a2a2a] border-[#3d3d3d] text-white placeholder:text-gray-500 focus-visible:border-gray-500 focus-visible:ring-gray-500/20";

interface FormResetPasswordProps {
  token?: string;
  email?: string;
}

export const FormResetPassword = ({ token, email }: FormResetPasswordProps) => {
  const { mutate: resetPassword, status } = useResetPassword();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ...FORM_DATA,
      token: token || "",
      email: email || "",
    },
  });

  useEffect(() => {
    if (token) {
      form.setValue("token", token);
    }
    if (email) {
      form.setValue("email", email);
    }
  }, [token, email, form]);

  function onSubmit(values: TFormSchema) {
    resetPassword(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your_email@gmail.com"
                  className={darkInput}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput
                  placeholder="New Password"
                  className={darkInput}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <PasswordInput
                  placeholder="Confirm New Password"
                  className={darkInput}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full !bg-white !text-black hover:!bg-gray-100 font-semibold mt-2"
          loading={status === "pending"}
        >
          Reset Password
        </Button>
      </form>
    </Form>
  );
};
