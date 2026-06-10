import {cn} from "@/lib/utils";

type Props = {
  className?: string;
  withWordmark?: boolean;
  monochrome?: "white" | "black";
};

export default function IconLogo({
                                    className,
                                    withWordmark = true,
                                  }: Props) {
  return (
    <div className={cn("inline-flex items-center gap-2 bg-white p-1 rounded", className)}>
      {withWordmark ? <img
        src="/logo-full.svg"
        alt="iconico"
        className="h-16 w-auto"
        width={95}
        height={50}
        loading="lazy"
        decoding="async"
      /> : <img
        src="/logo.svg"
        alt="iconico"
        className="h-3 w-auto"
        width={30}
        height={20}
        loading="lazy"
        decoding="async"
      />}
      {/*<svg*/}
      {/*  viewBox="0 0 64 32"*/}
      {/*  fill="none"*/}
      {/*  xmlns="http://www.w3.org/2000/svg"*/}
      {/*  aria-hidden="true"*/}
      {/*  className="h-8 w-auto"*/}
      {/*>*/}
      {/*  <path*/}
      {/*    d="M16 6 C7 6 2 12 2 16 C2 20 7 26 16 26 C25 26 30 20 32 16 C34 12 39 6 48 6 C57 6 62 12 62 16 C62 20 57 26 48 26 C39 26 34 20 32 16"*/}
      {/*    stroke={stroke}*/}
      {/*    strokeWidth="3"*/}
      {/*    strokeLinecap="round"*/}
      {/*    strokeLinejoin="round"*/}
      {/*  />*/}
      {/*</svg>*/}
      {/*{withWordmark && (*/}
      {/*  <span*/}
      {/*    className="font-semibold tracking-tight text-lg lowercase"*/}
      {/*    style={{ color: stroke }}*/}
      {/*  >*/}
      {/*    iconico*/}
      {/*  </span>*/}
      {/*)}*/}
    </div>
  );
}
