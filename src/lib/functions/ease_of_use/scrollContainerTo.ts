export function scrollContainerTo(elContainer: HTMLElement | null, elItem: HTMLElement | null) {
	if (!elContainer || !elItem) return;
	const containerRect = elContainer.getBoundingClientRect();
	const refRect = elItem.getBoundingClientRect();
	const targetTop = refRect.top - containerRect.top + elContainer.scrollTop;

	elContainer.scrollTo({
		top: targetTop,
		behavior: 'smooth'
	});

	// DIAGNOSTICS
	//! The problem is that scrollHeight === clientHeight

	// const containerRect = elContainer.getBoundingClientRect();
	// const refRect = elItem.getBoundingClientRect();
	// const targetTop = refRect.top - containerRect.top + elContainer.scrollTop;

	// console.log('scrollHeight:', elContainer.scrollHeight);
	// console.log('clientHeight:', elContainer.clientHeight);
	// console.log('can scroll:', elContainer.scrollHeight > elContainer.clientHeight);
	// console.log('targetTop:', targetTop, 'current scrollTop:', elContainer.scrollTop);
	// console.log(
	// 	'target in range:',
	// 	targetTop >= 0 && targetTop <= elContainer.scrollHeight - elContainer.clientHeight
	// );

	// if (elContainer.scrollHeight > elContainer.clientHeight) {
	// 	elContainer.scrollTo({ top: targetTop });
	// }
}
