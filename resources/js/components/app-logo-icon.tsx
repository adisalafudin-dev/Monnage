import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M4 7.5C4 6.119 5.119 5 6.5 5H17.5C18.881 5 20 6.119 20 7.5V17C20 18.105 19.105 19 18 19H6C4.895 19 4 18.105 4 17V7.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="M4 9H17.5C18.881 9 20 10.119 20 11.5V14.5C20 15.881 18.881 17 17.5 17H4V9Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <circle cx="16.5" cy="13" r="1.1" fill="currentColor" />
        </svg>
    );
}
