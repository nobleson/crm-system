var User = (function() {
    'use strict';
    var _template = ` <div class="col-sm-12  col-md-12  col-lg-6 mt-3">
                        <div class="card profile-card-5">
                            <div class="card-img-block">
                                <img class="card-img-top imgSrc" src="" alt="...">
                            </div>
                            <div class="card-body pt-0">
                            <h5 class="card-title fullname"></h5>
                            <p class="card-text address"></p>
                            <a href="#" class="idnumber"></a>
                        </div>
                        </div>
                    </div>`;              
    var _profile = {};
  
    return {
        getUser: function () {
            return _profile;
          },
        setUser: function (data) {
             _profile = data;
          },
          getProfileTemplate: function () {
            return _template;
          },
          async  uploadPicture(url = '', data = {}) {
            // Default options are marked with *
            const response = await fetch(url, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+window.localStorage.getItem("uid")
                // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // no-referrer, *client
                body: JSON.stringify(data) // body data type must match "Content-Type" header
            });
            return await response.json(); // parses JSON response into native JavaScript objects
          },
          async  getUserData(url = '') {
            // Default options are marked with *
            const response = await fetch(url, {
                method: 'GET', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+window.localStorage.getItem("uid")
                // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // no-referrer, *client
            });
            return await response.json(); // parses JSON response into native JavaScript objects
        },
        async  loginUser(url = '', data = {}) {  
          // Default options are marked with *
          const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(data) // body data type must match "Content-Type" header
          });
          return await response.json(); // parses JSON response into native JavaScript objects
      },

    }
  }());
