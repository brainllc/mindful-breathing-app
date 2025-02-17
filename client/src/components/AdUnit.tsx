import { HTMLProps } from "react";

interface Props extends HTMLProps<HTMLDivElement> {
  slot: string;  // AdSense ad slot ID
  format?: "auto" | "fluid";
  responsive?: boolean;
  layout?: "in-article" | "display";
}

export function AdUnit({ 
  slot, 
  format = "auto", 
  responsive = true, 
  layout,
  className = "", 
  ...props 
}: Props) {
  return (
    <div className={`ad-container ${className}`} {...props}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}