$(document).ready(function () {
   
    var buildRecipeDiv = function (recipes) {
        var image = recipes.bgImage;
        var title = recipes.title;
        if (recipes.title.length > 40) {
            title = recipes.title.substring(0, 40) + "...";
        }
        var description = recipes.description;
        if (recipes.description.length > 80) {
            description = recipes.description.substring(0, 80) + "...";
        }
        var id = recipes.id;
        var recipeDiv = "<div class=\"col-xs-6 col-md-4 recipe\"><a class=\"thumbnail\" href=\"..\\html\\recipe.html?id=" + id + "\"><img src=\"" + image + "\" alt=\"\"></a><h4 class=\"title\">" + title + "</h4><p class=\"description\">" + description + "</p></div>";
        $('.recipe-grid').append(recipeDiv);
    };
   
   // get all recipes
    $.getJSON("recipes.json", function(recipes) {
        var recipe;
        for (var i = 0, length = recipes.length; i < length; i++) {
            recipe = recipes[i];
            buildRecipeDiv(recipe);
        }
    });
    
});