const _DH = require('../helpers/getdata');

_DH.registerData()

setTimeout(function() {
    console.log(_DH.getData(20705))
}, 1000)