import { Render } from '@measured/puck/rsc';
import type { Locale } from '@/i18n/types';
import type { PuckData } from '@/lib/puck/types';
import { puckConfig } from './config';

/**
 * Server-side render of published Puck data on a public page (RSC-safe). The
 * page's locale is passed to blocks via Puck metadata.
 */
export function RenderPage({ data, locale }: { data: PuckData; locale: Locale }) {
  return <Render config={puckConfig} data={data as unknown as never} metadata={{ locale }} />;
}
