import doc_sequences from '$lib/data/doc_sequences.json';
import type { PageServerLoad } from './$types';
import type { TSeqPosthumKeys } from '$lib/types/TSequences';
import type { TDocuments } from '$lib/types/documents/TDocuments';
import { documents as allDocs } from '$lib/data/documents.json';

export const load: PageServerLoad = ({ params }) => {
	const docs = allDocs.posthum as TDocuments['documents']['posthum'];
	const seqSlug = params.posthumSequenceId as TSeqPosthumKeys;
	const sequences = doc_sequences['doc_sequences'].posthum;

	// Cross-Reference
	const crossRef = {};

	return { docs, sequences, seqSlug, crossRef };
};
