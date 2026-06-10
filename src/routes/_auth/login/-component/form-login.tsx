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

import { FORM_DATA } from "../-data";
import { FormSchema, type TFormSchema } from "../-type";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@tanstack/react-router";
import { useLogin } from "../-api/use-login";

const darkInput =
  "bg-[#2a2a2a] border-[#3d3d3d] text-white placeholder:text-gray-500 focus-visible:border-gray-500 focus-visible:ring-gray-500/20";

export const FormLogin = () => {
  const { mutate: login, status } = useLogin();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: FORM_DATA,
  });

  function onSubmit(values: TFormSchema) {
    login({
      ...values,
      type: "admin",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
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
                  placeholder="Password"
                  className={darkInput}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Checkbox className="border-gray-500 data-[state=checked]:bg-white data-[state=checked]:text-black" />
            <span className="text-sm text-gray-300">Remember me</span>
          </div>
          <Link to="/forgot-password" className="text-sm text-gray-400 hover:text-white">
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-white! text-black! hover:bg-gray-100! font-semibold mt-2"
          loading={status === "pending"}
        >
          Login
        </Button>
      </form>
    </Form>
  );
};
