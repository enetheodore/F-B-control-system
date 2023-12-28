import React, { useEffect, useState } from "react";
import pic from "../images/reciepimanagement.jpeg";
import Swal from "sweetalert2";

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/recipes/");
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };
  const handleCardClick = (recipe) => {
    Swal.fire({
      title: recipe.name,
      html: `
        <p>Error Margin: ${recipe.error_margin}</p>
        <p>Cost: ${recipe.cost}</p>
        <p>Theoretical Quantity: ${recipe.theoretical_quantity}</p>
        <h5 class="text-md font-semibold mt-4">Items:</h5>
        <ul>
          ${recipe.items
            .map(
              (item) =>
                `<li><span>${item.item.name}</span> - Used Quantity: ${item.used_quantity}</li>`
            )
            .join("")}
        </ul>
      `,
    });
  };

  return (
    <div className="p-4" style={{ backgroundImage: `url(${pic})`,backdropFilter: "blur(200px)",
    WebkitBackdropFilter: "blur(200px)", }}>
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Recipe List</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recipes !== undefined &&
          recipes !== null &&
          recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-thirtiary shadow-md p-4"
              onClick={() => handleCardClick(recipe)}>
              <h4 className="text-lg font-semibold mb-2">{recipe.name}</h4>
              <p>Error Margin: {recipe.error_margin}</p>
              <p>Cost: {recipe.cost}</p>
              <p>Theoretical Quantity: {recipe.theoretical_quantity}</p>
              <h5 className="text-md font-semibold mt-4">Ingredients:</h5>
              <ul>
                {recipe.items.map((i) => (
                  <li key={i.item.name}>
                    <span>{i.item.name}</span> - Used Quantity:{" "}
                    {i.used_quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
};

export default RecipeList;
