import React, { useState, useEffect } from "react";
import pic from "../images/dish.jpg";

const DishTable = () => {
  const [availableIngredients, setAvailableIngredints] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [dish, setDish] = useState([
    {
      dishName: "",
      ingredients: [{ id: "", name: "", cost: 0, quantity: 0 }],
      recipes: [{ id: "", name: "", cost: 0, quantity: 0 }],
      cost: 0,
      theoreticalQuantity: 0,
      errormargin: 0,
      price: 0,
    },
  ]);

  const dummyIngredients = [
    { name: "Ingredient 1", cost: 5 },
    { name: "Ingredient 2", cost: 10 },
    { name: "Ingredient 3", cost: 7 },
  ];

  const dummyRecipes = [
    { name: "Recipe 1", cost: 15 },
    { name: "Recipe 2", cost: 20 },
    { name: "Recipe 3", cost: 12 },
  ];

  const handleInputChange = (index, field, value) => {
    const updatedDish = [...dish];
    updatedDish[index][field] = value;
    setDish(updatedDish);
  };

  const handleIngredientChange = (index, ingredientIndex, field, value) => {
    const i = availableIngredients.find(
      (ingredient) => ingredient.itemName === value
    );
    const id = i ? i.itemId : null;

    const updatedDish = [...dish];
    updatedDish[index].ingredients[ingredientIndex][field] = value;
    if (field === "name") {
      updatedDish[index].ingredients[ingredientIndex]["id"] = id;
    }

    updatedDish[index].cost = calculateDishCost(updatedDish[index]);
    updatedDish[index].theoreticalQuantity = calculateDishQuantity(
      updatedDish[index]
    );
    setDish(updatedDish);
  };

  const handleRecipeChange = (index, recipeIndex, field, value) => {
    const i = recipes.find((recipe) => recipe.name === value);
    const id = i ? i.id : null;

    console.log("id", id);

    const updatedDish = [...dish];
    updatedDish[index].recipes[recipeIndex][field] = value;
    if (field === "name") {
      updatedDish[index].recipes[recipeIndex]["id"] = id;
    }
    updatedDish[index].cost = calculateDishCost(updatedDish[index]);
    updatedDish[index].theoreticalQuantity = calculateDishQuantity(
      updatedDish[index]
    );
    setDish(updatedDish);
  };

  const handleAddIngredient = (index) => {
    const updatedDish = [...dish];
    updatedDish[index].ingredients.push({
      id: "",
      name: "",
      cost: 0,
      quantity: 0,
    });
    updatedDish[index].cost = calculateDishCost(updatedDish[index]);
    setDish(updatedDish);
  };

  const handleAddRecipe = (index) => {
    const updatedDish = [...dish];
    updatedDish[index].recipes.push({ id: "", name: "", cost: 0, quantity: 0 });
    updatedDish[index].cost = calculateDishCost(updatedDish[index]);
    setDish(updatedDish);
  };

  const handleAddDish = () => {
    const newDish = {
      dishName: "",
      ingredients: [{ id: "", name: "", cost: 0, quantity: 0 }],
      recipes: [{ id: "", name: "", cost: 0, quantity: 0 }],
      cost: calculateDishCost(dish[dish.length - 1]),
      theoreticalQuantity: calculateDishQuantity(dish[dish.length - 1]),
      errormargin: 0,
      price: 0,
    };
    setDish((prevDish) => [...prevDish, newDish]);
  };

  const calculateDishCost = (d) => {
    let totalCost = 0;
    d.ingredients.forEach((ingredient) => {
      const matchedIngredient = availableIngredients.find(
        (availableIngredient) =>
          availableIngredient.itemName === ingredient.name
      );
      if (matchedIngredient) {
        totalCost += matchedIngredient.costPerQuantity * ingredient.quantity;
      }
    });
    d.recipes.forEach((recipe) => {
      const matchedrecipe = recipes.find(
        (recipe) => recipe.name === recipe.name
      );
      if (matchedrecipe) {
        totalCost += matchedrecipe.cost * recipe.quantity;
      }
    });

    return totalCost.toFixed(2);
  };

  const calculateDishQuantity = (d) => {
    let totalQuantity = 0;
    d.ingredients.forEach((ingredient) => {
      totalQuantity += parseInt(ingredient.quantity);
    });
    d.recipes.forEach((recipe) => {
      totalQuantity += parseInt(recipe.quantity);
    });
    return totalQuantity;
  };

  const handleSubmitDish = () => {
    dish.forEach((d) => {
      console.log(
        "get",
        JSON.stringify({
          name: d.dishName,
          items: d.ingredients,
          recipes: d.recipes,
          theoretical_quantity: d.theoreticalQuantity,
          cost: d.cost,
          error_margin: d.errormargin,
          price: d.price,
        })
      );

      fetch("http://localhost:8000/api/dishes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: d.dishName,
          items: d.ingredients,
          recipes: d.recipes,
          theoretical_quantity: d.theoreticalQuantity,
          cost: d.cost,
          error_margin: d.errormargin,
          price: d.price,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Handle the response data
          console.log("New dish added:", data);
        })
        .catch((error) => {
          // Handle the error
          console.error("Error adding new recipe:", error);
        });
    });
  };

  useEffect(() => {
    const fetchIngredients = async () => {
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
          console.log("Items fetched successfully", ingredients);
        } else {
          console.error("Failed to fetch items:", itemsData.status);
          // Handle the error accordingly
        }
      } catch (error) {
        console.error("Error fetching items:", error);
        // Handle the error accordingly
      }
    };

    const fetchRecipes = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/recipes/");
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      }
    };

    fetchRecipes();
    fetchIngredients();
  }, []);

  useEffect(() => {
    console.log("j", availableIngredients);
    console.log("d", dish);
  }, [availableIngredients, dish]);

  return (
    <div className="flex flex-col justify-items-center p-4 mb-20 ml-14 mr-2 overflow-x-hidden flex-grow"
    style={{ backgroundImage: `url(${pic})`,backdropFilter: "blur(200px)",
    WebkitBackdropFilter: "blur(200px)", }}>
      <button
        onClick={handleAddDish}
        className="px-4 py-2 mb-4 text-white bg-thirtiary rounded-lg shadow-md hover:bg-thirtiaryD">
        Add Dish
      </button>
      <div className="overflow-x-auto">
        <table className="w-full overflow-x-auto">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Dish Name</th>
              <th className="px-4 py-2">Ingredients</th>
              <th className="px-4 py-2">Recipes</th>
              <th className="px-4 py-2">Cost</th>
              <th className="px-4 py-2">Theoretical Quantity</th>
              <th className="px-4 py-2">Error Margin</th>
              <th className="px-4 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {dish.map((d, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-r-2 border-l-2  border-b-2">
                  <input
                    type="text"
                    value={d.dishName}
                    onChange={(e) =>
                      handleInputChange(index, "dishName", e.target.value)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-2 border-r-2 border-b-2">
                  <ul>
                    {d.ingredients.map((ingredient, ingredientIndex) => (
                      <li
                        key={ingredientIndex}
                        className="flex items-center mb-2">
                        <select
                          value={ingredient.name}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              ingredientIndex,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-1/2 px-2 py-1 mr-2 border border-gray-300 rounded">
                          <option value="">Select Ingredient</option>
                          {availableIngredients.map(
                            (availableIngredient, i) => (
                              <option
                                key={i}
                                value={availableIngredient.itemName}>
                                {availableIngredient.itemName}
                              </option>
                            )
                          )}
                        </select>
                        <input
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              ingredientIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-1/4 px-2 py-1 mr-2 border border-gray-300 rounded"
                        />
                        <label>{ingredient.quantity} kg</label>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => handleAddIngredient(index)}
                        className="px-2 py-1 text-white bg-thirtiary rounded-lg shadow-md hover:bg-green-600">
                        Add Ingredient
                      </button>
                    </li>
                  </ul>
                </td>
                <td className="px-4 py-2 border-r-2 border-b-2">
                  <ul>
                    {d.recipes.map((recipe, recipeIndex) => (
                      <li key={recipeIndex} className="flex items-center mb-2">
                        <select
                          value={recipe.name}
                          onChange={(e) =>
                            handleRecipeChange(
                              index,
                              recipeIndex,
                              "name",
                              e.target.value
                            )
                          }
                          className="w-1/2 px-2 py-1 mr-2 border border-gray-300 rounded">
                          <option value="">Select Recipe</option>
                          {recipes.map((recipe, i) => (
                            <option key={i} value={recipe.name}>
                              {recipe.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={recipe.quantity}
                          onChange={(e) =>
                            handleRecipeChange(
                              index,
                              recipeIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-1/4 px-2 py-1 mr-2 border border-gray-300 rounded"
                        />
                        <label>{recipe.quantity} kg</label>
                      </li>
                    ))}
                    <li>
                      <button
                        onClick={() => handleAddRecipe(index)}
                        className="px-2 py-1 text-white bg-thirtiary rounded-lg shadow-md hover:bg-green-600">
                        Add Recipe
                      </button>
                    </li>
                  </ul>
                </td>
                <td className="px-4 py-2 border-r-2 border-b-2">
                  {calculateDishCost(d)}
                </td>
                <td className="px-4 py-2 border-r-2 border-b-2">
                  {calculateDishQuantity(d)} kg
                </td>
                <td className="px-4 py-2 border-r-2 border-b-2">
                  <input
                    type="text"
                    value={d.errormargin}
                    onChange={(e) =>
                      handleInputChange(index, "errormargin", e.target.value)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Enter percentage"
                  />
                </td>
                <td className="px-4 py-2 border-r-2 border-b-2">
                  <input
                    type="text"
                    value={d.price}
                    onChange={(e) =>
                      handleInputChange(index, "price", e.target.value)
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Enter Price"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSubmitDish}
          type="submit"
          className="bg-thirtiary mt-4 rounded-lg text-white hover:text-NeonBlue shadow-md px-4 py-2 ">
          Submit
        </button>
      </div>
    </div>
  );
};

export default DishTable;
