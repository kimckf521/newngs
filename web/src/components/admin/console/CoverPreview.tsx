'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/member/design-v1/parts';
import { getCloudBaseApp } from '@/lib/cloudbase';

/** Resolve a cloud:// storage handle (or pass a plain URL/blob through) to a
 *  displayable image URL. Shared by the course card grid + the edit page. */
export function CoverPreview({ value, className = '' }: { value?: string; className?: string }) {
  const [url, setUrl] = useState<string | undefined>(value && !value.startsWith('cloud://') ? value : undefined);
  useEffect(() => {
    if (!value) return setUrl(undefined);
    if (!value.startsWith('cloud://')) return setUrl(value);
    let active = true;
    void (async () => {
      const app = await getCloudBaseApp();
      if (!app) return;
      try {
        const r = await app.getTempFileURL({ fileList: [value] });
        const u = r?.fileList?.[0]?.tempFileURL;
        if (active && u) setUrl(u);
      } catch {
        /* leave placeholder */
      }
    })();
    return () => {
      active = false;
    };
  }, [value]);
  return (
    <div className={`relative aspect-[16/9] w-full overflow-hidden bg-ngs-gradient-soft ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="grid h-full w-full place-items-center text-ngs-violet">
          <Icon name="book" className="h-8 w-8" />
        </span>
      )}
    </div>
  );
}
