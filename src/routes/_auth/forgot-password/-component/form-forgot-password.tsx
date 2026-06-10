import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FORM_DATA } from "../-data";
import { FormSchema, type TFormSchema } from "../-type";
import { useForgotPassword } from "../-api/use-forgot-password";

const darkInput =
  "bg-[#2a2a2a] border-[#3d3d3d] text-white placeholder:text-gray-500 focus-visible:border-gray-500 focus-visible:ring-gray-500/20";

export const FormForgotPassword = () => {
  const { mutate: forgotPassword, status } = useForgotPassword();

  const form = useForm<TFormSchema>({
    resolver: zodResolver(FormSchema),
    defaultValues: FORM_DATA,
  });

  function onSubmit(values: TFormSchema) {
    forgotPassword(values);
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

        <Button
          type="submit"
          className="w-full !bg-white !text-black hover:!bg-gray-100 font-semibold mt-2"
          loading={status === "pending"}
        >
          Send Reset Link
        </Button>
      </form>
    </Form>
  );
};
