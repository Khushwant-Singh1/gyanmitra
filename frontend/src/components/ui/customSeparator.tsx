import * as React from 'react';

interface CSeparatorProps {
  variant?: 'half' | 'full';
  className?: string;
}

const CSeparator: React.FC<CSeparatorProps> = ({
  variant = 'half',
  className = 'absolute left-0',
  ...props
}) => {
  return (
    <>
      {variant === 'full' ? (
        <svg
          height="7"
          viewBox="0 0 218 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          {...props}
        >
          <mask id="path-1-inside-1_7_2105" fill="white">
            <path d="M0 1.00018H217.5V4.75018H0V1.00018Z" />
          </mask>
          <path
            d="M0 1.75018H217.5V0.250183H0V1.75018ZM217.5 4.00018H0V5.50018H217.5V4.00018Z"
            fill="#DFDFDF"
            mask="url(#path-1-inside-1_7_2105)"
          />
          <rect y="1.00018" width="30" height="3.75" fill="#F4796C" />
          <mask
            id="mask0_7_2105"
            style={{ maskType: 'alpha' }}
            maskUnits="userSpaceOnUse"
            x="27"
            y="0"
            width="8"
            height="6"
          >
            <g clipPath="url(#clip0_7_2105)">
              <path
                d="M30 0.625183H34.5L31.5 5.12518H27L30 0.625183Z"
                fill="black"
              />
            </g>
          </mask>
          <g mask="url(#mask0_7_2105)">
            <rect x="27" y="0.625183" width="7.5" height="4.5" fill="white" />
          </g>
          <defs>
            <clipPath id="clip0_7_2105">
              <rect
                width="7.5"
                height="4.5"
                fill="white"
                transform="translate(27 0.625183)"
              />
            </clipPath>
          </defs>
        </svg>
      ) : (
        <svg
          width="28"
          height="5"
          viewBox="0 0 28 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          {...props}
        >
          <mask
            id="mask0_40_827"
            style={{ maskType: 'alpha' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="28"
            height="5"
          >
            <g clipPath="url(#clip0_40_827)">
              <path
                d="M0.258742 0.272339H27.9473L25.1785 4.59868H0.258742V0.272339Z"
                fill="black"
              />
            </g>
          </mask>
          <g mask="url(#mask0_40_827)">
            <rect
              x="0.258742"
              y="0.272339"
              width="27.6886"
              height="4.32634"
              fill="#F4796C"
            />
          </g>
          <defs>
            <clipPath id="clip0_40_827">
              <rect
                width="27.6886"
                height="4.32634"
                fill="white"
                transform="translate(0.258742 0.272339)"
              />
            </clipPath>
          </defs>
        </svg>
      )}
    </>
  );
};

export { CSeparator };
