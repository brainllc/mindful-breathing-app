import { HTMLProps } from "react";

interface Props extends HTMLProps<HTMLDivElement> {
  slot: string;  // AdSense ad slot ID
  format?: "auto" | "fluid";
  responsive?: boolean;
}

export function AdUnit({ slot, format = "auto", responsive = true, className = "", ...props }: Props) {
  return (
    <div className={`ad-container ${className}`} {...props}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"  // Replace with your AdSense publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
