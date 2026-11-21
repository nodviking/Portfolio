/** Boot-sequence preloader lines. `ok` appends a check mark once the line has typed. */
export const bootLines: { text: string; ok?: boolean }[] = [
	{ text: '> init nodviking.sys' },
	{ text: '> load design.module', ok: true },
	{ text: '> load dev.module', ok: true },
	{ text: '> compile portfolio… 100%' }
];
