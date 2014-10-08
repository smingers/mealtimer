$(document).ready(function () {

    var buildRecipeDiv = function (recipes) {
        var image = recipes.bgImage;
        var title = recipes.title;
        if (recipes.title.length > 60) {
            title = recipes.title.substring(0, 60) + "...";
        }
        var description = recipes.description;
        if (recipes.description.length > 80) {
            description = recipes.description.substring(0, 80) + "...";
        }
        var id = recipes.id;
        var recipeDiv = "<div class=\"col-xs-6 col-md-4 recipe\"><a class=\"thumbnail\" href=\"/recipe?id=" + id + "\"><img src=\"" + image + "\" alt=\"\"><div class=\"title-description\"><h4 class=\"title\">" + title + "</h4></div></div></a>";
        $('.recipe-grid').append(recipeDiv);
    };

    // set width of title & description div
    var imgWidth = $('.thumbnail img').css('width');
    $('.title-description').css('width', imgWidth);
    $(window).resize(function () {
        imgWidth = $('.thumbnail img').css('width');
        $('.title-description').css('width', imgWidth);
    });

   // get all recipes
    $.getJSON("/assets/recipes.json", function(recipes) {
        var recipe;
        for (var i = 0, length = recipes.length; i < length; i++) {
            recipe = recipes[i];
            buildRecipeDiv(recipe);
        }
    });

});
