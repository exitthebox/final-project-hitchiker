angular.module('app.rideboard', [])
    .controller('RideboardController', Rideboard);

function Rideboard() {
    console.info('Rideboard.initialized')
}