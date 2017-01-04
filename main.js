// TODO: refactor this with the ready function below.
document.addEventListener('DOMContentLoaded', function() {
  var formEl = document.getElementById('send-sms');
  var inputEl = formEl.querySelector('input');

  formEl.addEventListener('submit', function(e) {
    e.preventDefault();
    var inputValue = inputEl.value;
    var request = new XMLHttpRequest();
    request.open('POST', '/');
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(inputValue);
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
