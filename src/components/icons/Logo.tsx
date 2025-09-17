import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width="40"
      height="40"
      {...props}
    >
      <defs>
        <pattern
          id="pattern"
          patternUnits="userSpaceOnUse"
          width="10"
          height="10"
        >
          <path
            d="M0 0 H5 V5 H10 V10 H5 V5 H0z"
            fill="hsl(var(--primary-foreground))"
            opacity="0.8"
          />
          <path
            d="M5 0 H10 V5 H5z M0 5 H5 V10 H0z"
            fill="hsl(var(--primary-foreground))"
            opacity="0.6"
          />
        </pattern>
      </defs>
      <circle cx="50" cy="50" r="48" fill="hsl(var(--primary))" />
      <text
        x="50"
        y="62"
        fontFamily="Alegreya, serif"
        fontSize="50"
        fill="url(#pattern)"
        textAnchor="middle"
        fontWeight="bold"
      >
        G
      </text>
    </svg>
  );
}
