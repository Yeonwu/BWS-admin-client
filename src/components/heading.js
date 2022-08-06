export function Heading(state, pages) {
    let $heading = writeHTML(state.currentPageIdx, pages);

    // TODO : 페이지 전환 기능 만들기.
    // (백업 페이지 개발 후)

    return $heading;
}

function writeHTML(currentPageIdx, pages) {
    let $heading = document.createElement("div");
    $heading.id = "heading";
    $heading.className = "w3-container";

    let innerHTML = `
	<div id="heading-current-page">
		<h1>${pages[currentPageIdx]}</h1>
	</div>
	<div id="heading-page-list">`;
    innerHTML += pages.reduce((prev, cur) => (prev += `<div>${cur}</div>`), "");
    innerHTML += `</div>`;

    $heading.innerHTML = innerHTML;

    return $heading;
}
