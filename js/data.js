/* exported data */
var data = {
  entryId: 1,
  footprints: [],
  editing: null,
  delete: null
};

var previousFootprintEntries = localStorage.getItem('javascript-local-storage');
if (previousFootprintEntries !== null) {
  data = JSON.parse(previousFootprintEntries);
}

window.addEventListener('beforeunload', beforeUnloadHandle);

function beforeUnloadHandle(event) {
  data.editing = null;
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('javascript-local-storage', dataJSON);
}
