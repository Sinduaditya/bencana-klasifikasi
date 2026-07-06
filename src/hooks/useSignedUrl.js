import { useState, useEffect } from "react";
import { supabase } from "../services/supabase";

export function useSignedUrl(bucket, path) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!path) return;
    let mounted = true;
    supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600)
      .then(({ data, error }) => {
        if (!error && mounted) setUrl(data.signedUrl);
      });
    return () => {
      mounted = false;
    };
  }, [bucket, path]);

  return url;
}
