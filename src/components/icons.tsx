import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v15H6.5C5.83696 17 5.20107 16.7366 4.73223 16.2678C4.26339 15.7989 4 15.163 4 14.5V3.5C4 2.83696 4.26339 2.20107 4.73223 1.73223C5.20107 1.26339 5.83696 1 6.5 1C7.16304 1 7.79893 1.26339 8.26777 1.73223C8.73661 2.20107 9 2.83696 9 3.5V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 8L16.2929 6.70711C16.6834 6.31658 17.3166 6.31658 17.7071 6.70711L19 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 6V4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 9L19.2929 9.70711C18.9024 10.0976 18.9024 10.7308 19.2929 11.1213L20 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
