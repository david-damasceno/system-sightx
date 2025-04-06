
import React from "react";
import { cn } from "@/lib/utils";

interface SightXLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  colorClass?: string;
}

const SightXLogo: React.FC<SightXLogoProps> = ({ 
  className, 
  size = "md",
  colorClass = "text-sightx-purple" 
}) => {
  const sizeClassMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };
  
  return (
    <div className={cn("flex items-center", className)}>
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 300 187.5"
        className={cn(sizeClassMap[size], colorClass)}
        preserveAspectRatio="xMidYMid meet"
      >
        <g clipPath="url(#e7ffea59ae)">
          <g clipPath="url(#eed79ac1ca)">
            <path fill="currentColor" d="M 53.777344 133.84375 L 53.777344 53.203125 L 127.507812 53.203125 L 127.507812 133.84375 Z M 53.777344 133.84375 " />
          </g>
        </g>
        <g clipPath="url(#55922dfb59)">
          <g clipPath="url(#457a8ca164)">
            <path fill="currentColor" d="M 246.21875 53.152344 L 246.21875 133.792969 L 172.488281 133.792969 L 172.488281 53.152344 Z M 246.21875 53.152344 " />
          </g>
        </g>
        <g clipPath="url(#013f02e760)">
          <g clipPath="url(#358954cd96)">
            <path fill="currentColor" d="M 292.714844 178.570312 L 7.601562 178.570312 L 7.601562 8.433594 L 292.714844 8.433594 Z M 292.714844 178.570312 " />
          </g>
        </g>
        <g clipPath="url(#c1469d9fa5)">
          <g clipPath="url(#4730d2e2ec)">
            <g clipPath="url(#acbf368fb8)">
              <path fill="#459d3d" d="M 86.5625 123 L 83.109375 79.558594 L 158.621094 73.554688 L 162.074219 116.996094 Z M 86.5625 123 " />
            </g>
          </g>
        </g>
        <g clipPath="url(#a96eaee0f1)">
          <g clipPath="url(#3b94516d4d)">
            <g clipPath="url(#44287166fc)">
              <path fill="#4abd40" d="M 213.429688 63.996094 L 216.882812 107.4375 L 141.371094 113.441406 L 137.917969 70 Z M 213.429688 63.996094 " />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default SightXLogo;
