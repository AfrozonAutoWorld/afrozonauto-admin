type LoaderProps = { src: string; width: number; quality?: number };

export default function cloudinaryLoader({ src, width, quality }: LoaderProps): string {
  const params = `w_${width},q_${quality ?? 75},f_auto,c_limit`;
  return src.replace('/upload/', `/upload/${params}/`);
}
