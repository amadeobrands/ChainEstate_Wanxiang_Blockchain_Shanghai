
axios.defaults.baseURL = 'https://chainlease.azurewebsites.net/';

axios.defaults.headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Credentials': 'true',
};



axios.defaults.validateStatus = function (status) {
    if (status == 401) {
      user_account.request_login();
    }
    return status >= 200 && status < 300; // default
  };

var get_info_factom = axios.create({
  method: 'GET',
  url: 'factom_get/',
  strictSSL: false,
});
var push_info_factom = axios.create({
  method: 'POST',
  url: 'factom_post/',
  strictSSL: false,
});
