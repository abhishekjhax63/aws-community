import { avifSrcSet } from "../lib/responsiveImage";

type Props = {
  src: string;
  alt?: string;
  sizes?: string;
  className?: string;
  loading?: "eager" | "lazy";
  decoding?: "async" | "sync" | "auto";
  draggable?: boolean;
};

/**
 * A photograph that serves compact AVIF variants where the browser supports
 * them and otherwise falls back to the untouched original JPEG. It renders the
 * exact same `<img>` element as before, so existing styles continue to apply;
 * only the bytes on the wire change. Non-gallery sources pass straight through.
 */
export default function ResponsivePhoto({ src, alt = "", sizes, ...rest }: Props) {
  const avif = avifSrcSet(src);
  if (!avif) {
    return <img src={src} alt={alt} {...rest} />;
  }
  return (
    <picture>
      <source type="image/avif" srcSet={avif} sizes={sizes} />
      <img src={src} alt={alt} sizes={sizes} {...rest} />
    </picture>
  );
}
