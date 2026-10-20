import { useEffect, useState } from "react";

/** Preview of a File picked in a form. Creates one object URL per file and revokes it afterwards. */
export function FileImage({ file, className }: { file: File; className?: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url ? <img src={url} alt="" className={className} /> : null;
}
