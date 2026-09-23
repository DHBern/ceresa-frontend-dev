import { type TUnpublishedKeys } from '$lib/types/documents/TUnpublishedKeys';
import { type TPosthumKeys } from '$lib/types/documents/TPosthumKeys';
import { type TPublishedKeys } from '$lib/types/documents/TPublishedKeys';

export type TTimelineEntry = {
	meta: {
		generated_by: string;
		task: string;
		generated_on: string;
		description: string;
	};
	timeline: {
		date: string;
		biography_info: string;
		event: string;
		textWork: string;
		textPub: string;
		work_id: TUnpublishedKeys | TPublishedKeys | TPosthumKeys;
		note: string;
	};
};

export type TTimeline = TTimelineEntry[];
