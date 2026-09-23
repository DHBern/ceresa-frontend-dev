import doc_sequences from '$lib/data/doc_sequences.json';
import type { PageServerLoad } from './$types';
import type { TSeqUnpublishedKeys } from '$lib/types/TSequences';
import type { TDocuments } from '$lib/types/documents/TDocuments';
import { documents as allDocs } from '$lib/data/documents.json';

export const load: PageServerLoad = ({ params }) => {
	const docs = allDocs.unpublished as TDocuments['documents']['unpublished'];
	const seqSlug = params.unpublishedSequenceId as TSeqUnpublishedKeys;
	const sequences = doc_sequences['doc_sequences'].unpublished;

	// Cross-Reference
	const crossRef = {};

	return { docs, sequences, seqSlug, crossRef };
};
