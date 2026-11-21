export const TYPESWITHGROUPCONTROL = {
	register: ['people', 'places', 'orgs']
};
export const TYPESWITHSORTCONTROL = {
	register: []
};

export const DOC_EDTYPE_STYLES: Record<string, string> = {
	in_periodico: 'bg-yellow-100 text-yellow-900',
	in_volume: 'bg-orange-100 text-orange-900',
	in_giornale: 'bg-amber-100 text-amber-900',
	manoscritto: 'bg-red-100 text-red-900',
	dattiloscritto: 'bg-rose-100 text-rose-900'
};

export const DOC_GENRETYPE_STYLES: Record<string, string> = {
	saggi: 'bg-blue-100 text-blue-900',
	romanzi: 'bg-blue-100 text-blue-900',
	racconti: 'bg-blue-100 text-blue-900',
	traduzioni: 'bg-blue-100 text-blue-900',
	dizionario: 'bg-blue-100 text-blue-900',
	poesie: 'bg-blue-100 text-blue-900',
	'testi_teatrali': 'bg-blue-100 text-blue-900'
};

export const DOCTYPE_STYLES: Record<string, string> = {
	published: 'bg-teal-100 text-teal-900',
	unpublished: 'bg-blue-100 text-blue-900',
	posthum: 'bg-green-100 text-green-900',
};

export const DRAWER_SNAP_POINTS = ['220px', 0.5, 1];
