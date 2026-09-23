import doc_sequences from '$lib/data/doc_sequences.json';
import type { PageServerLoad } from './$types';
import type { TSeqPublishedKeys } from '$lib/types/TSequences';
import type { TDocuments } from '$lib/types/documents/TDocuments';
import { documents as allDocs } from '$lib/data/documents.json';

export const load: PageServerLoad = ({ params }) => {
	const docs = allDocs.published as TDocuments['documents']['published'];
	const seqSlug = params.publishedSequenceId as TSeqPublishedKeys;
	const sequences = doc_sequences['doc_sequences'].published;

	// Cross-Reference
	const crossRef = {};

	return { docs, sequences, seqSlug, crossRef };
};
