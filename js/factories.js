app.factory('infoFonctionsFactory', ['$http', function ($http) {
    return {
        /*fonction de récupération du fichier json*/
        recupData: function (url) {
            return $http.get(url);
        }
        , /*fonction de récupération du nombre de pattes à afficher dans le select*/
        recupNbrPattes: function () {
            var retour = [];
            console.dir("====================");
            console.dir("====================");
            console.dir("====================");
            return retour;
        }
        , /*fonction de récupération du animaux en fonction de leur nombre de pattes*/
        recupAnimauxPattes: function (data, nbr) {
            var retour = [];
            for (var key in data) {
                if (data[key].pattes == nbr) {
                    retour.push(data[key]);
                }
            }
            return retour;
        }
    }
}]);