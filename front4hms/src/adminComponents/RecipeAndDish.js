import React, { useState, useEffect } from "react";
import pic from "../images/ingredients.jpg";
import { useNavigate } from "react-router-dom";

const RecipeManagement = () => {
  const [recipes, setRecipes] = useState([]);
  const [availableIngredients, setAvailableIngredints] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [recipeName, setRecipeName] = useState("");
  const [errorMargin, setErrorMargin] = useState(0);
  const [showSelect, setShowSelect] = useState(false);
  const navigate = useNavigate();

  const toggleSelect = () => {
    setShowSelect(!showSelect);
  };
  const handleRecipeListNav = () => {
    navigate("/recipe-list");
  };

  const handleAddRecipe = () => {
    const ingredients = selectedIngredients.map((ingredient) => ({
      id: ingredient.itemId,
      used_quantity: ingredient.usedQuantity,
    }));

    const totalCost = selectedIngredients.reduce(
      (total, ingredient) =>
        total + ingredient.usedQuantity * ingredient.costPerQuantity,
      0
    );

    const totalQuantity = selectedIngredients.reduce(
      (total, ingredient) => total + ingredient.usedQuantity,
      0
    );

    const newRecipe = {
      name: recipeName,
      items: ingredients,
      error_margin: errorMargin,
      cost: totalCost,
      theoretical_quantity: totalQuantity,
    };
    console.log(newRecipe);

    fetch("http://localhost:8000/api/recipes/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRecipe),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data
        console.log("New recipe added:", data);
        setRecipes([...recipes, data]);
        setRecipeName("");
        setErrorMargin(0);
        setSelectedIngredients([]);
      })
      .catch((error) => {
        // Handle the error
        console.error("Error adding new recipe:", error);
      });
  };

  const handleDeleteRecipe = (index) => {
    const updatedRecipes = [...recipes];
    updatedRecipes.splice(index, 1);
    setRecipes(updatedRecipes);
  };

  const handleIngredientQuantityChange = (itemName, quantity) => {
    const updatedIngredients = selectedIngredients.map((ingredient) =>
      ingredient.itemName === itemName
        ? { ...ingredient, usedQuantity: parseInt(quantity) }
        : ingredient
    );
    setSelectedIngredients(updatedIngredients);
  };

  const handleAddIngredient = (itemName) => {
    toggleSelect();
    const ingredient = availableIngredients.find(
      (item) => item.itemName === itemName
    );

    if (ingredient) {
      const existingIngredient = selectedIngredients.find(
        (item) => item.itemName === itemName
      );

      if (existingIngredient) {
        // Update the quantity if the ingredient already exists
        const updatedIngredients = selectedIngredients.map((item) =>
          item.itemName === itemName
            ? { ...item, usedQuantity: item.usedQuantity + 1 }
            : item
        );
        setSelectedIngredients(updatedIngredients);
      } else {
        // Add the ingredient if it doesn't exist
        setSelectedIngredients([
          ...selectedIngredients,
          {
            itemId: ingredient.itemId,
            itemName: ingredient.itemName,
            usedQuantity: 1,
            costPerQuantity: ingredient.costPerQuantity,
          },
        ]);
      }
    }
  };

  const handleDeleteIngredient = (itemName) => {
    const updatedIngredients = selectedIngredients.filter(
      (item) => item.itemName !== itemName
    );
    setSelectedIngredients(updatedIngredients);
  };

  useEffect(() => {
    const fetchItemNames = async () => {
      try {
        const itemsData = await fetch(`http://localhost:8000/api/items/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (itemsData.ok) {
          const items = await itemsData.json();
          const ingredients = items.map((itemData) => ({
            itemId: itemData.id,
            itemName: itemData.name,
            availableQuantity: itemData.quantity,
            costPerQuantity: itemData.price,
          }));
          setAvailableIngredints(ingredients);
          console.log("Items fetched successfully");
        } else {
          console.error("Failed to fetch items:", itemsData.status);
          // Handle the error accordingly
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        // Handle the error accordingly
      }
    };

    fetchItemNames();
  }, []);

  return (
    <div className="container mx-auto p-4 overflow-y-auto " style={{ backgroundImage: `url(${pic})`,backdropFilter: "blur(200px)",
    WebkitBackdropFilter: "blur(200px)", }}>
      <h2 className="text-3xl font-bold mb-4 text-center">Recipe Management</h2>
      {/* <div class="overflow-x-auto">
        <table class="table-auto w-full border-collapse">
          <thead>
            <tr class="bg-gray-200">
              <th class="px-4 py-2 text-gray-800 font-bold border">
                Recipe Name
              </th>
              <th class="px-4 py-2 text-gray-800 font-bold border">
                Ingredients
              </th>
              <th class="px-4 py-2 text-gray-800 font-bold border">
                Error Margin
              </th>
              <th class="px-4 py-2 text-gray-800 font-bold border">Cost</th>
              <th class="px-4 py-2 text-gray-800 font-bold border">
                Theoretical Quantity
              </th>
              <th class="px-4 py-2 text-gray-800 font-bold border"></th>
            </tr>
          </thead>
          <tbody>
            {recipes !== undefined &&
              recipes !== null &&
              recipes.map((recipe, index) => (
                <tr key={index} class="bg-white">
                  <td class="px-4 py-2 border">{recipe.recipeName}</td>
                  <td class="px-4 py-2 border">
                    <ul>
                      {recipe.ingredients.map((ingredient, i) => (
                        <li key={i}>
                          {ingredient.itemName} - {ingredient.usedQuantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td class="px-4 py-2 border">{recipe.errorMargin}</td>
                  <td class="px-4 py-2 border">{recipe.cost}</td>
                  <td class="px-4 py-2 border">{recipe.theoreticalQuantity}</td>
                  <td class="px-4 py-2 border">
                    <button
                      onClick={() => handleDeleteRecipe(index)}
                      class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div> */}

      <div className="mb-4">
        <div className="flex justify-between">
          <h3 className="text-xl font-bold mb-2">Create Recipe</h3>
          <button
            onClick={handleRecipeListNav}
            className="text-gray-700 font-bold mb-4 bg-transparent hover:bg-gray-200 text-sm py-2 px-4 border border-gray-400 rounded focus:outline-none focus:shadow-outline">
            Recipe List
          </button>
        </div>

        <label className="block text-gray-700 font-bold mb-2">
          Recipe Name:
        </label>
        <input
          type="text"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-bold mb-2">
          Error Margin:
        </label>
        <input
          type="number"
          value={errorMargin}
          onChange={(e) => setErrorMargin(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <button
          onClick={toggleSelect}
          className="text-gray-700 font-bold mb-4 bg-transparent hover:bg-gray-200 text-sm py-2 px-4 border border-gray-400 rounded focus:outline-none focus:shadow-outline">
          Add an Ingredient:
        </button>
        {showSelect && (
          <div className="relative">
            <select
              onChange={(e) => handleAddIngredient(e.target.value)}
              className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
              <option value="">Select an ingredient</option>
              {availableIngredients.map((ingredient, index) => (
                <option key={index} value={ingredient.itemName}>
                  {ingredient.itemName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20">
                <path d="M14.707 7.293a1 1 0 00-1.414 0L10 10.586 6.707 7.293a1 1 0 00-1.414 1.414l3.5 3.5a1 1 0 001.414 0l3.5-3.5a1 1 0 000-1.414z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <h4 className="text-lg font-bold mb-2">Ingredients</h4>
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-gray-800 font-bold border">
                Ingredient Name
              </th>
              <th className="px-4 py-2 text-gray-800 font-bold border">
                Quantity
              </th>
              <th className="px-4 py-2 text-gray-800 font-bold border"></th>
            </tr>
          </thead>
          <tbody>
            {selectedIngredients.map((ingredient, index) => (
              <tr key={index} className="bg-white">
                <td className="px-4 py-2 border">{ingredient.itemName}</td>
                <td className="px-4 py-2 border">
                  <input
                    type="number"
                    value={ingredient.usedQuantity}
                    onChange={(e) =>
                      handleIngredientQuantityChange(
                        ingredient.itemName,
                        e.target.value
                      )
                    }
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDeleteIngredient(ingredient.itemName)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAddRecipe}
        className="bg-thirtiary hover:bg-thirtiaryD text-white font-bold py-2 px-4 mt-10 rounded focus:outline-none focus:shadow-outline w-full">
        Create Recipe
      </button>
    </div>
  );
};

export default RecipeManagement;
