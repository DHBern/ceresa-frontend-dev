export function getTabPositionClass(index: number, total: number): string {
	if (total < 2) return '--single';
	if (index === 0) return '--left';
	if (index === total - 1) return '--right';
	return '--center';
}
