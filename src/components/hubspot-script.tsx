"use client";

import Script from "next/script";

const HubSpotScript = () => (
  <Script
    id="hs-script-loader"
    strategy="afterInteractive"
    src="//js-eu1.hs-scripts.com/147269675.js"
  />
);

export default HubSpotScript;
