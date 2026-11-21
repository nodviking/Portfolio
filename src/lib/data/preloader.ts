/** Boot-sequence preloader. */

/** Comment block typed first. */
export const bootComment = ['/*', '  Booting nodviking.sys...', '*/'];

/** Log lines; `status` is right-aligned in brackets once the line has typed. */
export const bootLines: { text: string; status?: 'OK' | 'RUN' }[] = [
	{ text: '...reading the brief' },
	{ text: 'Set mode to: DEV × DESIGN' },
	{ text: '{ Loading modules }' },
	{ text: '' },
	{ text: 'Loading design.module', status: 'OK' },
	{ text: 'Loading dev.module', status: 'OK' },
	{ text: 'Mounting storeenv.cli', status: 'OK' },
	{ text: 'Indexing clients.log', status: 'OK' },
	{ text: 'Compiling portfolio', status: 'RUN' }
];

/** Labels under the progress bar (left, middle, right). */
export const bootLabels = ['Design', 'Build', 'Ship'] as const;
