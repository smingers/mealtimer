$(document).ready(function () {
   
    var buildRecipeDiv = function (recipes) {
        var image = recipes.bgImage;
        var title = recipes.title;
        var description = recipes.description;
        if (recipes.description.length > 150) {
            description = recipes.description.substring(0, 150) + "...";
        }
        var id = recipes.id;
        var recipeDiv = "<div class=\"col-xs-6 col-md-4 recipe\"><a class=\"thumbnail\" href=\"..\\html\\?recipe=" + id + "\"><img src=\"" + image + "\" alt=\"\"></a><h4 class\"title\">" + title + "</h4><p class=\"description\">" + description + "</p></div>";
        $('.recipe-grid').append(recipeDiv);
        console.log(recipes.id);
        console.log(recipes.title);
        console.log(recipes.description);
        console.log(recipes.bgImage);
    };
   
   // get recipe from JSON array of objects; currently hard coding the ID number
    $.getJSON("recipes.json", function(recipes) {
        var recipe;
        for (var i = 0, length = recipes.length; i < length; i++) {
            recipe = recipes[i];
            buildRecipeDiv(recipe);
        }
    });
    
});