document.addEventListener("DOMContentLoaded", function() {
    const searchInputData = document.getElementById("searchInput");
    const searchButtonId = document.getElementById("searchButton");
    const showResults = document.getElementById("resultsSection");
    const saveButtonId = document.getElementById("saveButton");
    const showDrinkDialog = document.getElementById("drinkDialog");
    const closeDialogButton = document.getElementById("closeDialog");
    const saveRecipeButton = document.getElementById("saveRecipe");

    // Event listener for search button
    searchButtonId.addEventListener("click", function() {
        const searchTerm = searchInputData.value.trim();
        if (searchTerm === "") {
            displayErrorMessage("Please enter a cocktail name.");
            return;
        }

        searchCocktail(searchTerm);
    });

    // Event listener for save button
    saveButtonId.addEventListener("click", function() {
        const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
        if (savedRecipes.length === 0) {
            displayErrorMessage("No saved recipes found.");
        } else {
            displaySavedRecipes(savedRecipes);
        }
    });

    // Event listener for close dialog button
    closeDialogButton.addEventListener("click", function() {
        showDrinkDialog.close();
    });

    // Event listener for save recipe button in dialog
    saveRecipeButton.addEventListener("click", function() {
        const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
        const recipe = {
            name: drinkDialog.dataset.name,
            instructions: drinkDialog.dataset.instructions
        };
        savedRecipes.push(recipe);
        localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
        displaySuccessMessage("Recipe saved successfully!");
        
    });

    // Function to search for cocktails
    function searchCocktail(searchTerm) {
        fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`)
            .then(response => response.json())
            .then(data => {
                if (data.drinks === null) {
                    displayErrorMessage("No results found. Please try a different search term.");
                } else {
                    displayResults(data.drinks);
                }
            })
            .catch(error => {
                displayErrorMessage("An error occurred while fetching data. Please try again later.");
                console.error(error);
            });
    }

    // Function to display search results
    function displayResults(results) {
        showResults.innerHTML = ""; 
        results.forEach(result => {
            const cocktailDiv = document.createElement("div");
            cocktailDiv.classList.add("cocktail");

            const cocktailImage = document.createElement("img");
            cocktailImage.src = result.strDrinkThumb;
            cocktailImage.alt = result.strDrink;
            cocktailImage.addEventListener("click", function() {
                openDrinkDialog(result);
            });

            const cocktailName = document.createElement("p");
            cocktailName.textContent = result.strDrink;
            cocktailName.classList.add("cocktail-name");
            cocktailName.addEventListener("click", function() {
                openDrinkDialog(result);
            });

            const cloneButton = document.createElement("button");
            cloneButton.textContent = "Save Recipe";
            cloneButton.addEventListener("click", function() {
                cloneRecipe(result);
            });

            cocktailDiv.appendChild(cocktailImage);
            cocktailDiv.appendChild(cocktailName);
            cocktailDiv.appendChild(cloneButton);
            showResults.appendChild(cocktailDiv);
        });
    }

    // Function to open drink dialog
    function openDrinkDialog(drink) {
        showDrinkDialog.innerHTML = `
            <h3>${drink.strDrink}</h3>
            <p>${drink.strInstructions}</p>
            <button id="saveRecipe">Save Recipe</button>
            <button id="closeDialog">Close</button>
        `;
        showDrinkDialog.dataset.name = drink.strDrink;
        showDrinkDialog.dataset.instructions = drink.strInstructions;
        const saveRecipeButton = showDrinkDialog.querySelector("#saveRecipe");
        saveRecipeButton.addEventListener("click", function() {
            saveRecipe(drink);
        });
        const closeDialogButton = showDrinkDialog.querySelector("#closeDialog");
        closeDialogButton.addEventListener("click", function() {
            showDrinkDialog.close();
        });
        showDrinkDialog.showModal();
    }

    function cloneRecipe(recipe) {
        const drink = {
            name: recipe.strDrink,
            instructions: recipe.strInstructions
        };
        openDrinkDialog(drink);
    }

// Function to save recipe
function saveRecipe(recipe) {
    const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
  // check is saved
    const isAlreadySaved = savedRecipes.some(savedRecipe => savedRecipe.idDrink === recipe.idDrink);
    if (isAlreadySaved) {
        displayErrorMessage("Recipe is already saved.");
        showDrinkDialog.close();
    } else {
        savedRecipes.push({
            idDrink: recipe.idDrink,
            img: recipe.strDrinkThumb,
            name: recipe.strDrink,
            instructions: recipe.strInstructions
        });
        localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
        showDrinkDialog.close();
        alert("Recipe saved successfully!")
        
        searchButtonId.click();
        
    }
    
}

function displaySavedRecipes(recipes) {
    showResults.innerHTML = ""; // Clear previous results
    recipes.forEach(recipe => {
        const savedRecipeDiv = document.createElement("div");
        savedRecipeDiv.classList.add("saved-recipe");

        const savedRecipeImage = document.createElement("img");
        savedRecipeImage.src = recipe.img;
        savedRecipeImage.alt = recipe.name;
        savedRecipeImage.classList.add("saved-recipe-image");
        // Add event listener to open dialog on image click
        savedRecipeImage.addEventListener("click", function() {
            openSavedDrinkDialog(recipe);
        });

        const savedRecipeName = document.createElement("p");
        savedRecipeName.textContent = recipe.name;
        savedRecipeName.classList.add("saved-recipe-name");
        // Add event listener to open dialog on name click
        savedRecipeName.addEventListener("click", function() {
            openSavedDrinkDialog(recipe);
        });

        // const savedRecipeInstructions = document.createElement("p");
        // savedRecipeInstructions.textContent = recipe.instructions;
        // savedRecipeInstructions.classList.add("saved-recipe-instructions");

        savedRecipeDiv.appendChild(savedRecipeImage);
        savedRecipeDiv.appendChild(savedRecipeName);
        // savedRecipeDiv.appendChild(savedRecipeInstructions);
        showResults.appendChild(savedRecipeDiv);
    });
// delete from saved list saved 
function openSavedDrinkDialog(recipe) {
    showDrinkDialog.innerHTML = `
        <h3>${recipe.name}</h3>
        <p>${recipe.instructions}</p>
        <button id="deleteRecipe">Delete Recipe</button>
        <button id="closeDialog">Close</button>
    `;
    const deleteRecipeButton = showDrinkDialog.querySelector("#deleteRecipe");
    deleteRecipeButton.addEventListener("click", function() {
        deleteRecipe(recipe.idDrink);
    });
    const closeDialogButton = showDrinkDialog.querySelector("#closeDialog");
    closeDialogButton.addEventListener("click", function() {
        showDrinkDialog.close();
    });
    showDrinkDialog.showModal();
}

// Function to delete a recipe from saved list
function deleteRecipe(recipeId) {
    let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
    savedRecipes = savedRecipes.filter(recipe => recipe.idDrink !== recipeId);
    localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
    displaySuccessMessage("Recipe deleted successfully!");
    showDrinkDialog.close();
    saveButtonId.click();
}


}
    function displayErrorMessage(message) {
        showResults.innerHTML = `<p class="error-message">${message}</p>`;
    }

    function displaySuccessMessage(message) {
        showResults.innerHTML = `<p class="success-message">${message}</p>`;
    }
});
