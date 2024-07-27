window.onload = function () {
  var today = new Date();
  today.setDate(today.getDate());
  var yyyy = today.getFullYear();
  var mm = ("0"+(today.getMonth()+1)).slice(-2);
  var dd = ("0"+today.getDate()).slice(-2);
  document.getElementById("inputDate").value=yyyy+'-'+mm+'-'+dd;
}
