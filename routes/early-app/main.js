// TODO: refactor this with the ready function below.
document.addEventListener('DOMContentLoaded', function() {
  var formEl = document.getElementById('send-sms');
  var inputEl = formEl.querySelector('input');

  formEl.addEventListener('submit', function(e) {
    e.preventDefault();
    var data = JSON.stringify({message: inputEl.value});
    var request = new XMLHttpRequest();
    request.open('POST', '/send');
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.send(data);
    inputEl.value = '';
  });
});

// function ready(fn) {
//   if (document.readyState != 'loading'){
//     fn();
//   } else {
//     document.addEventListener('DOMContentLoaded', fn);
//   }
// }
