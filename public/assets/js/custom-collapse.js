const collapseElementList = document.querySelectorAll(".collapse.collapsible")
console.log(...collapseElementList)
const collapseList = [...collapseElementList].map(
  (collapseEl) => new bootstrap.Collapse(collapseEl)
)
