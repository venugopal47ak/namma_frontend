import { useEffect, useState } from "react";

const createPlaceholder = ({ label, accent, background }) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" role="img" aria-label="${label}">
      <rect width="600" height="300" fill="${background}" />
      <circle cx="120" cy="90" r="48" fill="${accent}" opacity="0.18" />
      <circle cx="500" cy="240" r="92" fill="${accent}" opacity="0.12" />
      <rect x="48" y="196" width="228" height="18" rx="9" fill="${accent}" opacity="0.28" />
      <rect x="48" y="228" width="152" height="14" rx="7" fill="${accent}" opacity="0.2" />
      <text x="48" y="122" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="${accent}">
        ${label}
      </text>
    </svg>`
  )}`;

export const imageFallbacks = {
  banner: createPlaceholder({
    label: "Provider banner",
    accent: "#0f766e",
    background: "#dff6f2"
  }),
  avatar: createPlaceholder({
    label: "Provider profile",
    accent: "#1d4ed8",
    background: "#dbeafe"
  }),
  service: createPlaceholder({
    label: "Service",
    accent: "#f06543",
    background: "#fff1f1"
  })
};

const FallbackImage = ({ src, fallbackSrc, alt, ...props }) => {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setImageSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...props}
      src={imageSrc || fallbackSrc}
      alt={alt}
      onError={() => {
        if (imageSrc !== fallbackSrc) {
          setImageSrc(fallbackSrc);
        }
      }}
    />
  );
};

export default FallbackImage;
