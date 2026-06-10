import { cn } from "@/lib/utils";



type TProps = React.ComponentProps<"img">;
export default function Logo({ className, ...props }: TProps) {
  
  return (
    <img
      src={"/logo-full.svg"}
      alt="Logo"
      className={cn("max-w-64", className)}
      {...props}
    />
  );
}
